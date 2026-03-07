import os
import requests
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from utils.logger import get_logger

logger = get_logger(__name__)

@retry(
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout)),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    stop=stop_after_attempt(5),
    before_sleep=lambda retry_state: logger.warning(
        "Request failed, retrying in %ss (attempt %d/5)...",
        retry_state.next_action.sleep,
        retry_state.attempt_number
    )
)
def fetch_json(url: str, timeout: int = 30) -> dict:
    logger.info("Fetching %s", url)
    
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
    
    logger.info("Successfully fetched: %s", url)
    
    return response.json()
    
def download_to_cache(url: str, cache_path: str) -> str:
    if os.path.exists(cache_path):
        logger.info("Cache hit, skipping download: %s", cache_path)
        return cache_path
    
    response = requests.get(url, timeout=120, stream=True)
    response.raise_for_status()
    
    logger.info("Downloading %s to %s", url, cache_path)
    
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    with open(cache_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    logger.info("Download complete: %s", cache_path)
            
    return cache_path