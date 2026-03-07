import os
from utils.logger import get_logger
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

logger = get_logger(__name__)
Base = declarative_base()

def get_engine():
    user = os.getenv("MYSQL_USER")
    password = os.getenv("MYSQL_PASSWORD")
    host = os.getenv("MYSQL_HOST", "mysql")
    port = os.getenv("MYSQL_PORT", "3306")
    database = os.getenv("MYSQL_DATABASE")
    
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"

    engine = create_engine(url, pool_pre_ping=True)
    
    logger.info("Database engine created: %s:%s/%s", host, port, database)
    
    return engine

def test_connection(engine):
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
        logger.info("Connection successful")
        
def get_session_factory(engine):
    return sessionmaker(bind=engine, autocommit=False, autoflush=False)
        
if __name__ == "__main__":
    engine = get_engine()
    test_connection(engine)