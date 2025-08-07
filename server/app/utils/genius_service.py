import requests
from flask import current_app as app


session = requests.Session()
session.headers = {
    "Authorization": f"Bearer {app.config["GENIUS_API_ACCESS_TOKEN"]}",
    "Accept": "application/json"
}
GENIUS_BASE_URL = "https://api.genius.com"


def make_request():
    response = session.get(F"{GENIUS_BASE_URL}search?q=Kendrick+lamar")
    response.raise_for_status()
    print(response.text, response.status_code)


def search_genius(query):
    access_token = app.config['GENIUS_API_ACCESS_TOKEN']
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {'q': query}
    response = requests.get(
        f'{GENIUS_BASE_URL}/search',
        headers=headers,
        params=params
    )
    if response.status_code == 200:
        return response.json()['response']
    return {'hits': []}