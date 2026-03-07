import os
from sqlalchemy import create_engine, text

def get_engine():
    user = os.getenv("MYSQL_USER")
    password = os.getenv("MYSQL_PASSWORD")
    host = os.getenv("MYSQL_HOST", "mysql")
    port = os.getenv("MYSQL_PORT", "3306")
    database = os.getenv("MYSQL_DATABASE")
    
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"

    engine = create_engine(url, pool_pre_ping=True)
    return engine

def test_connection(engine):
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
        print("Connection successful")
        
if __name__ == "__main__":
    engine = get_engine()
    test_connection(engine)