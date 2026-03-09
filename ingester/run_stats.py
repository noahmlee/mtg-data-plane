from db.connection import get_engine, get_session_factory
from pipeline.stats import DailyStatsPipeline

engine = get_engine()
Session = get_session_factory(engine)
session = Session()

try:
    pipeline = DailyStatsPipeline(session)
    pipeline.run()
finally:
    session.close()