from abc import ABC, abstractmethod
from utils.logger import get_logger

class BasePipeline(ABC):
    
    def __init__(self, name: str, session):
        self.name = name
        self.session = session
        self.logger = get_logger(f"pipeline.{name}")
        self._records_processed = 0
        
    @abstractmethod
    def extract(self):
        pass
    
    @abstractmethod
    def transform(self, data):
        pass
    
    @abstractmethod
    def load(self, data) -> int:
        pass
        
    def run(self) -> bool:
        self.logger.info("Starting pipeline: %s", self.name)
        
        try:
            self.logger.info("[EXTRACT] Starting...")
            raw = self.extract()
            self.logger.info("[EXTRACT] Complete.")

            self.logger.info("[TRANSFORM] Starting...")
            cleaned = self.transform(raw)
            self.logger.info("[TRANSFORM] Complete.")

            self.logger.info("[LOAD] Starting...")
            self._records_processed = self.load(cleaned)
            self.logger.info("[LOAD] Complete, Records: %d", self._records_processed)
            
            return True
        
        except Exception as e:
            self.logger.error("Pipeline %s failed: %s", self.name, e, exc_info=True)
            return False