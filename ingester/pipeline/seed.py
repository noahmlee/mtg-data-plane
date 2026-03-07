import json
from pipeline.base import BasePipeline
from utils.http import download_to_cache
from sqlalchemy.dialects.mysql import insert
from db.models import Set, Card

MTGJ_URL = "https://mtgjson.com/api/v5/AllPrintings.json"
CACHE_DIR = "/app/cache"

class AllPrintingsSeedPipeline(BasePipeline):
    
    def __init__(self, session):
        super().__init__("all_printings_seed", session)
        
    def extract(self) -> dict:
        cache_path = download_to_cache(
            MTGJ_URL,
            f"{CACHE_DIR}/AllPrintings.json"
        )
        self.logger.info("Parsing AllPrintings.json...")
        with open(cache_path, "r") as f:
            data = json.load(f)
        return data.get("data", {})
    
    def transform(self, data: dict) -> dict:
        sets = []
        cards = []
        
        for set_code, set_data in data.items():
            sets.append({
                "code": set_code,
                "name": set_data.get("name", ""),
                "release_date": set_data.get("releaseDate"),
                "set_type": set_data.get("type"),
                "total_cards": set_data.get("totalSetSize")
            })
            
            for card in set_data.get("cards", []):
                if card.get("layout") in ("token", "emblem", "art_series"):
                    continue
                
                cards.append({
                    "uuid": card.get("uuid"),
                    "name": card.get("name"),
                    "mana_cost": card.get("manaCost"),
                    "mana_value": card.get("manaValue"),
                    "color_identity": card.get("colorIdentity", []),
                    "colors": card.get("colors", []),
                    "rarity": card.get("rarity"),
                    "type_line": card.get("type"),
                    "set_code": set_code,
                    "collector_number": card.get("number"),
                    "is_foil_only": card.get("isFoilOnly", False),
                    "is_promo": card.get("isPromo", False)
                })
                
        self.logger.info(
            "Transformed %d sets and %d cards.",
            len(sets), len(cards)
        )
        return {"sets": sets, "cards": cards}
    
    def load(self, data: dict) -> int:
        sets = data["sets"]
        cards = data["cards"]

        self.logger.info("Loading %d sets...", len(sets))
        for i in range(0, len(sets), 500):
            batch = sets[i:i + 500]
            stmt = insert(Set).values(batch)
            stmt = stmt.on_duplicate_key_update(
                name=stmt.inserted.name,
                release_date=stmt.inserted.release_date,
                set_type=stmt.inserted.set_type,
                total_cards=stmt.inserted.total_cards,
            )
            self.session.execute(stmt)
        self.session.commit()
        
        self.logger.info("Loading %d cards...", len(cards))
        for i in range(0, len(cards), 1000):
            batch = cards[i:i + 1000]
            stmt = insert(Card).values(batch)
            stmt = stmt.on_duplicate_key_update(
                name=stmt.inserted.name,
                mana_cost=stmt.inserted.mana_cost,
                mana_value=stmt.inserted.mana_value,
                color_identity=stmt.inserted.color_identity,
                colors=stmt.inserted.colors,
                rarity=stmt.inserted.rarity,
                type_line=stmt.inserted.type_line,
                set_code=stmt.inserted.set_code,
                collector_number=stmt.inserted.collector_number,
                is_foil_only=stmt.inserted.is_foil_only,
                is_promo=stmt.inserted.is_promo,
            )
            self.session.execute(stmt)
            self.session.commit()
            self.logger.info(
                "Progress: %d/%d",
                min(i + 1000, len(cards)),
                len(cards)
            )
            
        return len(cards)