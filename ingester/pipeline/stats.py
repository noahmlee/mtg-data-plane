import json
from datetime import date
from pipeline.base import BasePipeline
from sqlalchemy import text
from sqlalchemy.dialects.mysql import insert
from db.models import DailyStat

class DailyStatsPipeline(BasePipeline):
    
    def __init__(self, session):
        super().__init__("daily_stats", session)
        self.today = date.today()
        
    def extract(self) -> list:
        self.logger.info("Compiling stats for %s", self.today)
        
        most_expensive = self.session.execute(text("""
            SELECT c.uuid, c.name, p.price_usd
            FROM cards c
            JOIN prices p ON c.uuid = p.card_uuid
            WHERE p.price_date = :today AND p.format = 'normal'
            ORDER BY p.price_usd DESC
            LIMIT 1
        """), {"today": self.today}).fetchone()
        
        total = self.session.execute(text("""
            SELECT COUNT(DISTINCT card_uuid)
            FROM prices
            WHERE price_date = :today AND format = 'normal'
        """), {"today": self.today}).scalar()
        
        by_rarity = self.session.execute(text("""
            SELECT c.rarity, AVG(p.price_usd)
            FROM cards c
            JOIN prices p ON c.uuid = p.card_uuid
            WHERE p.price_date = :today 
            AND p.format = 'normal'
            AND p.price_usd > 0
            AND c.rarity IN ('common', 'uncommon', 'rare', 'mythic', 'special')
            GROUP BY c.rarity
        """), {"today": self.today}).fetchall()
        
        by_cmc = self.session.execute(text("""
            SELECT c.mana_value, AVG(p.price_usd)
            FROM cards c
            JOIN prices p ON c.uuid = p.card_uuid
            WHERE p.price_date = :today
            AND p.format = 'normal'
            AND p.price_usd > 0
            AND c.mana_value IS NOT NULL
            AND c.mana_value >= 0
            AND c.mana_value != 0.5
            AND c.mana_value <= 16
            GROUP BY c.mana_value
            ORDER BY c.mana_value
        """), {"today": self.today}).fetchall()
        
        by_color = self.session.execute(text("""
            SELECT c.color_identity, AVG(p.price_usd)
            FROM cards c
            JOIN prices p on c.uuid = p.card_uuid
            WHERE p.price_date = :today AND p.format = 'normal'
            GROUP by c.color_identity                                                   
        """), {"today": self.today}).fetchall()
        
        return {
            "most_expensive": most_expensive,
            "total": total,
            "by_rarity": by_rarity,
            "by_cmc": by_cmc,
            "by_color": by_color,
        }
        
    def transform(self, data: dict) -> dict:
        most_expensive = data["most_expensive"]
        total = data["total"]
        by_rarity = data["by_rarity"]
        by_cmc = data["by_cmc"]
        by_color = data["by_color"]

        rarity_dict = {row[0]: float(row[1]) for row in by_rarity}
        
        cmc_dict = {str(row[0]): float(row[1]) for row in by_cmc}

        color_map = {
            "W": "avg_price_white",
            "U": "avg_price_blue",
            "G": "avg_price_green",
            "B": "avg_price_black",
            "R": "avg_price_red",
        }
        
        color_avgs = {}
        for row in by_color:
            colors = json.loads(row[0]) if row[0] else []
            avg = float(row[1])
            if len(colors) == 0:
                color_avgs["avg_price_colorless"] = avg
            elif len(colors) == 1:
                col = color_map.get(colors[0])
                if col:
                    color_avgs[col] = avg
            else:
                color_avgs["avg_price_multicolor"] = avg
                
        return {
            "stat_date": self.today,
            "most_expensive_card_uuid": most_expensive[0] if most_expensive else None,
            "most_expensive_card_name": most_expensive[1] if most_expensive else None,
            "most_expensive_card_price": float(most_expensive[2]) if most_expensive else None,
            "total_cards_priced": total,
            "avg_price_per_rarity": json.dumps(rarity_dict),
            "avg_price_per_cmc": json.dumps(cmc_dict),
            "avg_price_white": color_avgs.get("avg_price_white"),
            "avg_price_blue": color_avgs.get("avg_price_blue"),
            "avg_price_green": color_avgs.get("avg_price_green"),
            "avg_price_black": color_avgs.get("avg_price_black"),
            "avg_price_red": color_avgs.get("avg_price_red"),
            "avg_price_multicolor": color_avgs.get("avg_price_multicolor"),
            "avg_price_colorless": color_avgs.get("avg_price_colorless"),
        }
        
    def load(self, data: dict) -> int:
        stmt = insert(DailyStat).values([data])
        stmt = stmt.on_duplicate_key_update(
            most_expensive_card_uuid=stmt.inserted.most_expensive_card_uuid,
            most_expensive_card_name=stmt.inserted.most_expensive_card_name,
            most_expensive_card_price=stmt.inserted.most_expensive_card_price,
            avg_price_white=stmt.inserted.avg_price_white,
            avg_price_blue=stmt.inserted.avg_price_blue,
            avg_price_green=stmt.inserted.avg_price_green,
            avg_price_black=stmt.inserted.avg_price_black,
            avg_price_red=stmt.inserted.avg_price_red,
            avg_price_multicolor=stmt.inserted.avg_price_multicolor,
            avg_price_colorless=stmt.inserted.avg_price_colorless,
            avg_price_per_cmc=stmt.inserted.avg_price_per_cmc,
            avg_price_per_rarity=stmt.inserted.avg_price_per_rarity,
            total_cards_priced=stmt.inserted.total_cards_priced,
        )
        self.session.execute(stmt)
        self.session.commit()
        self.logger.info("Stats loaded for %s", data["stat_date"])
        return 1
        