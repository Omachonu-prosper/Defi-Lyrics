import os
from dotenv import load_dotenv


load_dotenv()

class Config:
    LOG_LEVEL = (os.getenv('LOG_LEVEL') or 'INFO').upper()
    GENIUS_API_ACCESS_TOKEN = os.getenv('GENIUS_API_ACCESS_TOKEN')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL') or 'gpt-4.1-mini'
    MONGO_URI = os.getenv('MONGO_URI') or 'mongodb://localhost:27017'
    MONGO_DB_NAME = os.getenv('MONGO_DB_NAME') or 'defi_lyrics'
    CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD') or 0.8)
    MAX_REFINEMENTS = int(os.getenv('MAX_REFINEMENTS') or 2)
