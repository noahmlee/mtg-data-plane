import os
from db.connection import get_engine, get_session_factory
from pipeline.daily import DailyCardPricePipeline
from pipeline.stats import DailyStatsPipeline
from pipeline.seed import AllPrintingsSeedPipeline
from apscheduler.schedulers.blocking import BlockingScheduler
from utils.logger import get_logger

logger = get_logger(__name__)
engine = get_engine()
Session = get_session_factory(engine)

def run_pipelines():
    session = Session()
    
    try:
        if os.getenv("SEED_ON_STARTUP", "false").lower() == "true":
            AllPrintingsSeedPipeline(session).run()
        DailyCardPricePipeline(session).run()
        DailyStatsPipeline(session).run()
    finally:
        session.close()
            
logger.info("Running pipelines on startup...")
run_pipelines()

scheduler = BlockingScheduler()
scheduler.add_job(run_pipelines, trigger="cron", hour=0, minute=5, timezone="America/New_York")
logger.info("Scheduler started, next run at 00:05 EST/EDT daily.")
scheduler.start()