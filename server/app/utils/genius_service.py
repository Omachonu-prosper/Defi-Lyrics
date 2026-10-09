import requests
from flask import current_app as app


def search_genius(query, page=1, page_size=10):
    access_token = app.config['GENIUS_API_ACCESS_TOKEN']
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {'q': query, 'page': page, 'per_page': page_size}
    response = requests.get('https://api.genius.com/search', headers=headers, params=params, timeout=10)
    response.raise_for_status()
    return response.json()['response']


def get_song(song_id):
    """Fetch song metadata from Genius. Returns None if the song doesn't exist."""
    access_token = app.config['GENIUS_API_ACCESS_TOKEN']
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(f'https://api.genius.com/songs/{song_id}', headers=headers, timeout=10)
    if response.status_code == 404:
        return None
    response.raise_for_status()
    song = response.json()['response']['song']
    album = song.get('album') or {}
    return {
        'genius_id': song['id'],
        'title': song['title'],
        'artist': song['primary_artist']['name'],
        'album': album.get('name'),
        'release_date': song.get('release_date_for_display'),
        'art_url': song.get('song_art_image_url'),
        'genius_url': song['url'],
    }
