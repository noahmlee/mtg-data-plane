from db.connection import get_engine, get_session_factory
from pipeline.daily import DailyCardPricePipeline
from utils.http import fetch_json

engine = get_engine()
Session = get_session_factory(engine)
session = Session()

try:
    pipeline = DailyCardPricePipeline(session)
    pipeline.run()
finally:
    session.close()