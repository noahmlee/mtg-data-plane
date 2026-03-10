import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

app = FastAPI(title="MTG Price Tracker API")
url = f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@{os.getenv('MYSQL_HOST')}:{os.getenv('MYSQL_PORT')}/{os.getenv('MYSQL_DATABASE')}"
engine = create_engine(url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
@app.get("/health")
def health():
    return{"status": "ok"}

@app.get("/cards/search")
def search_cards(name: str, db: Session = Depends(get_db)):
    results = db.execute(
        text("SELECT uuid, name, mana_cost, color_identity, rarity, set_code, collector_number FROM cards WHERE name LIKE :name"),
        {"name": f"%{name}%"}
    ).fetchall()
    
    return [
        {
            "uuid": r[0],
            "name": r[1],
            "mana_cost": r[2],
            "color_identity": r[3],
            "rarity": r[4],
            "set_code": r[5],
            "collector_number": r[6]
        }
        for r in results
    ]
    
@app.get("/cards/{uuid}")
def get_card(uuid: str, db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT c.uuid, c.name, c.mana_cost, c.color_identity, c.rarity, 
                   c.set_code, c.collector_number, p.price_usd, p.price_date
            FROM cards c
            LEFT JOIN prices p ON c.uuid = p.card_uuid
            AND p.price_date = (SELECT MAX(price_date) FROM prices WHERE card_uuid = c.uuid)
            AND p.format = 'normal'
            WHERE c.uuid = :uuid
        """),
        {"uuid": uuid}
    ).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Card not found")
    
    return {
        "uuid": result[0],
        "name": result[1],
        "mana_cost": result[2],
        "color_identity": result[3],
        "rarity": result[4],
        "set_code": result[5],
        "collector_number": result[6],
        "price": float(result[7])
    }
    
@app.get("/stats/latest")
def get_latest_stats(db: Session = Depends(get_db)):
    result = db.execute(
        text("SELECT * FROM daily_stats ORDER BY stat_date DESC LIMIT 1")
    ).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="No stats found")

    return dict(result._mapping)

@app.get("/stats/{date}")
def get_stats_by_date(date: str, db: Session = Depends(get_db)):
    result = db.execute(
        text("SELECT * FROM daily_stats WHERE stat_date = :date LIMIT 1"),
        {"date": date}
    ).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="No stats found")
    
    return dict(result._mapping)

@app.get("/cards/{uuid}/prices")
def get_card_price(uuid: str, db: Session = Depends(get_db)):
    results = db.execute(
        text("""
            SELECT price_date, format, price_usd
            FROM prices
            WHERE card_uuid = :uuid
            ORDER BY price_date DESC
        """),
        {"uuid": uuid}
    ).fetchall()
    
    if not results:
        raise HTTPException(status_code=404, detail="No prices found")
    
    return [
        {"price_date": str(r[0]), "format": r[1], "price_usd": float(r[2])}
        for r in results
    ]