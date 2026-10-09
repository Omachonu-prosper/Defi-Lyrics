from flask import current_app as app
from pymongo import MongoClient, ASCENDING


_client = None


def get_songs_collection():
    global _client
    if _client is None:
        # Fail fast instead of pymongo's 30s default when Mongo is down
        client = MongoClient(app.config['MONGO_URI'], serverSelectionTimeoutMS=5000)
        client[app.config['MONGO_DB_NAME']]['songs'].create_index([('genius_id', ASCENDING)], unique=True)
        _client = client
    return _client[app.config['MONGO_DB_NAME']]['songs']
