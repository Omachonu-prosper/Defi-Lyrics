import os
from dotenv import load_dotenv
from flask import current_app as app


load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    GENIUS_API_ACCESS_TOKEN = os.getenv('GENIUS_API_ACCESS_TOKEN')