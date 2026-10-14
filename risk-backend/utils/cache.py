import os
import json
import atexit
from apscheduler.schedulers.background import BackgroundScheduler

DATA_CACHE = {}
CACHE_FILE = 'cache.json'

# Load cache from disk if available
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r') as f:
            DATA_CACHE.update(json.load(f))
        print(f"Loaded cache from {CACHE_FILE}")
    except Exception as e:
        print(f"Failed to load cache from {CACHE_FILE}: {e}")

# Save cache to disk on shutdown
def save_cache():
    try:
        with open(CACHE_FILE, 'w') as f:
            json.dump(DATA_CACHE, f)
        print(f"Saved cache to {CACHE_FILE}")
    except Exception as e:
        print(f"Failed to save cache to {CACHE_FILE}: {e}")

atexit.register(save_cache)

# Scheduler setup (to be started in main.py)
scheduler = BackgroundScheduler() 