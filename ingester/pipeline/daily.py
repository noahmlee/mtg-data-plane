from datetime import date
from pipeline.base import BasePipeline
from utils.http import fetch_json
from sqlalchemy import text
from sqlalchemy.dialects.mysql import insert
from db.models import CardPrice

MTGJ_PRICE_URL = "https://mtgjson.com/api/v5/AllPricesToday.json"

class DailyCardPricePipeline(BasePipeline):

    def __init__(self, session):
        super().__init__("all_prices_daily", session)
        self.today = date.today()
        
    def extract(self) -> dict:
        self.logger.info("Fetching card prices for %s", self.today)
        data = fetch_json(MTGJ_PRICE_URL)
        return data.get("data", {})
        
    def transform(self, data: dict) -> list[dict]:
        rows = []
        
        for card, provider_data in data.items():
            paper = provider_data.get("paper", {})
            tcg_player = paper.get("tcgplayer", {})
            retail = tcg_player.get("retail", {})

            for fmt in ("normal", "foil"):
                fmt_prices = retail.get(fmt, {})
                if not fmt_prices:
                    continue
                
                latest_date = max(fmt_prices.keys())
                price = fmt_prices[latest_date]

                if price is None:
                    continue

                rows.append({
                    "card_uuid": card,
                    "price_date": self.today,
                    "provider": "tcgplayer",
                    "format": fmt,
                    "price_usd": float(price)
                })
            
        self.logger.info("Transformed %d price rows.", len(rows))
        return rows
    
    def load(self, data: list[dict]) -> int:
        if not data:
            self.logger.warning("No price data to load.")
            return 0
        
        result = self.session.execute(text("SELECT uuid FROM cards"))
        known_uuids = {row[0] for row in result}
        
        filtered = [row for row in data if row["card_uuid"] in known_uuids]
        skipped = len(data) - len(filtered)
        
        self.logger.info(
            "Filtered %d rows with unknown UUIDs, loading %d rows.",
            skipped, len(filtered)
        )
        
        if not filtered:
            self.logger.warning("No valid price tows to load after filtering.")
            return 0
        
        batch_size = 1000
        total = 0
        
        for i in range(0, len(filtered), batch_size):
            batch = filtered[i:i + batch_size]
            stmt = insert(CardPrice).values(batch)
            stmt = stmt.on_duplicate_key_update(
                price_usd=stmt.inserted.price_usd
            )
            self.session.execute(stmt)
            self.session.commit()
            total += len(batch)
            self.logger.info("Loaded %d/%d rows.", total, len(filtered))
            
        return total