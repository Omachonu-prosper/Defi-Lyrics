import os
from dotenv import load_dotenv
from flask import current_app as app


load_dotenv()

class Config:
    def __init__(self):
        app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
        app.config['GENIUS_API_ACCESS_TOKEN'] = os.getenv('GENIUS_API_ACCESS_TOKEN')