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

def run_seed():
    session = Session()
    try:
        AllPrintingsSeedPipeline(session).run()
    finally:
        session.close()

logger.info("Running pipelines on startup...")
run_pipelines()

scheduler = BlockingScheduler()
scheduler.add_job(run_pipelines, trigger="cron", hour=0, minute=5, timezone="America/New_York")
scheduler.add_job(run_seed, trigger="cron", day="1,15", hour=2, minute=0, timezone="America/New_York")
logger.info("Scheduler started. Prices at 00:05 EST/EDT daily, seed refresh on the 1st and 15th at 02:00.")
scheduler.start()