from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, DECIMAL, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from db.connection import Base

class Set(Base):
    __tablename__ = "sets"
    
    code = Column(String(10), primary_key=True)
    name = Column(String(255), nullable=False)
    release_date = Column(DateTime)
    set_type = Column(String(50))
    total_cards = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    
class Card(Base):
    __tablename__ = "cards"
    
    uuid = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    mana_cost = Column(String(50))
    mana_value = Column(Float)
    color_identity = Column(JSON)
    colors = Column(JSON)
    rarity = Column(String(20))
    type_line = Column(String(255))
    set_code = Column(String(10), ForeignKey("sets.code"), nullable=False)
    collector_number = Column(String(10))
    is_foil_only = Column(Boolean, default=False)
    is_promo = Column(Boolean, default=False)
    frame_effects = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    
class CardPrice(Base):
    __tablename__ = "prices"
    __table_args__ = (
        UniqueConstraint("card_uuid", "price_date", "provider", "format", name="uq_price"),
    )
    
    id = Column(Integer, primary_key=True)
    card_uuid = Column(String(36), ForeignKey("cards.uuid"), nullable=False)
    price_date = Column(Date, nullable=False)
    provider = Column(String(50), nullable=False)
    format = Column(String(20), nullable=False)
    price_usd = Column(DECIMAL(10, 2))
    
class DailyStat(Base):
    __tablename__ = "daily_stats"
    __table_args__ =(
        UniqueConstraint("stat_date", name="uq_stat_date"),
    )
    
    id = Column(Integer, primary_key=True)
    stat_date = Column(Date, nullable=False)
    most_expensive_card_uuid = Column(String(36), ForeignKey("cards.uuid"))
    most_expensive_card_name = Column(String(255))
    most_expensive_card_price = Column(DECIMAL(10, 2))
    avg_price_white = Column(DECIMAL(10,2))
    avg_price_blue = Column(DECIMAL(10,2))
    avg_price_green = Column(DECIMAL(10,2))
    avg_price_black = Column(DECIMAL(10,2))
    avg_price_red = Column(DECIMAL(10,2))
    avg_price_multicolor = Column(DECIMAL(10,2))
    avg_price_colorless = Column(DECIMAL(10,2))
    avg_price_per_cmc = Column(JSON)
    avg_price_per_rarity = Column(JSON)
    total_cards_priced = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    
if __name__ == "__main__":
    from db.connection import get_engine
    engine = get_engine()
    Base.metadata.create_all(engine)
    print("Models verified successfully")