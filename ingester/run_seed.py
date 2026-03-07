from db.connection import get_engine, get_session_factory
from pipeline.seed import AllPrintingsSeedPipeline

engine = get_engine()
Session = get_session_factory(engine)
session = Session()

try:
    pipeline = AllPrintingsSeedPipeline(session)
    pipeline.run()
finally:
    session.close()