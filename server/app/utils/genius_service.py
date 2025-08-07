import os
import requests


def search_genius(query, page=1, page_size=10):
    access_token = os.getenv('GENIUS_API_ACCESS_TOKEN')
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {'q': query, 'page': page, 'per_page': page_size}
    response = requests.get('https://api.genius.com/search', headers=headers, params=params)
    if response.status_code == 200:
        return response.json()['response']
    return {'hits': []}