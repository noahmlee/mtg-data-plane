from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON, ForeignKey
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
    created_at = Column(DateTime, server_default=func.now())
    
if __name__ == "__main__":
    from db.connection import get_engine
    engine = get_engine()
    Base.metadata.create_all(engine)
    print("Models verified successfully")