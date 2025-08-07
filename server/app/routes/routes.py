from flask import current_app as app, request, jsonify
from app.utils.response import Response
from app.utils.genius_service import search_genius


@app.route('/api/v1')
def index():
    return Response.success_response("Defi-Lyrics Lyrics & Meaning API")


@app.route('/api/v1/search', methods=['GET'])
def search():
    query = request.args.get('query')
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 10))
    if not query:
        return jsonify({'error': 'Missing search query'}), 400

    results = search_genius(query, page, page_size)
    # Return only useful fields for the frontend
    formatted = [
        {
            'id': hit['result']['id'],
            'title': hit['result']['title'],
            'artist': hit['result']['primary_artist']['name'],
            'thumbnail': hit['result']['song_art_image_thumbnail_url'],
            'url': hit['result']['url']
        }
        for hit in results.get('hits', [])
    ]
    return jsonify({'results': formatted})