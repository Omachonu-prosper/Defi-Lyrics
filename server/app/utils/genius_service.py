import requests
from flask import current_app as app


session = requests.Session()
session.headers = {
    "Authorization": f"Bearer {app.config["GENIUS_API_ACCESS_TOKEN"]}",
    "Accept": "application/json"
}
GENIUS_BASE_URL = "https://api.genius.com/"


def make_request():
    response = session.get(F"{GENIUS_BASE_URL}search?q=Kendrick+lamar")
    response.raise_for_status()
    print(response.text, response.status_code)