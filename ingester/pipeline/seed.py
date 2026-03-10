import ijson
from pipeline.base import BasePipeline
from utils.http import download_to_cache
from sqlalchemy.dialects.mysql import insert
from db.models import Set, Card

MTGJ_URL = "https://mtgjson.com/api/v5/AllPrintings.json"
CACHE_DIR = "/app/cache"

SKIP_LAYOUTS = {"token", "emblem", "art_series"}

class AllPrintingsSeedPipeline(BasePipeline):

    def __init__(self, session):
        super().__init__("all_printings_seed", session)

    def extract(self):
        cache_path = download_to_cache(MTGJ_URL, f"{CACHE_DIR}/AllPrintings.json")
        self.logger.info("Streaming AllPrintings.json...")
        return cache_path

    def transform(self, cache_path):
        return cache_path

    def load(self, cache_path) -> int:
        total_cards = 0
        total_sets = 0

        with open(cache_path, "rb") as f:
            for set_code, set_data in ijson.kvitems(f, "data"):
                set_row = {
                    "code": set_code,
                    "name": set_data.get("name", ""),
                    "release_date": set_data.get("releaseDate"),
                    "set_type": set_data.get("type"),
                    "total_cards": set_data.get("totalSetSize"),
                }
                stmt = insert(Set).values([set_row])
                stmt = stmt.on_duplicate_key_update(
                    name=stmt.inserted.name,
                    release_date=stmt.inserted.release_date,
                    set_type=stmt.inserted.set_type,
                    total_cards=stmt.inserted.total_cards,
                )
                self.session.execute(stmt)

                cards = []
                for card in set_data.get("cards", []):
                    if card.get("layout") in SKIP_LAYOUTS:
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
                        "is_promo": card.get("isPromo", False),
                    })

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
                total_sets += 1
                total_cards += len(cards)

                if total_sets % 50 == 0:
                    self.logger.info("Progress: %d sets, %d cards loaded", total_sets, total_cards)

        self.logger.info("Seed complete: %d sets, %d cards", total_sets, total_cards)
        return total_cards