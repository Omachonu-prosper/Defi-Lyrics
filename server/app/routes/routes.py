import json
import logging
import queue
import threading

import requests
from flask import current_app as app, request, jsonify, g
from app.logging_config import request_id_var
from app.services.song_service import get_or_define_song, DefinitionError
from app.utils.response import Response
from app.utils.genius_service import search_genius


logger = logging.getLogger(__name__)


@app.route('/api/v1')
def index():
    return Response.success_response("Defi-Lyrics Lyrics & Meaning API")


@app.route('/api/v1/search', methods=['GET'])
def search():
    query = request.args.get('query')
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 10))
    if not query:
        return Response.error_response('Missing search query', 400)

    try:
        results = search_genius(query, page, page_size)
    except requests.RequestException:
        logger.exception("Genius search failed for %r", query)
        return Response.error_response(
            "Couldn't reach Genius to search for songs.", 502, data={'request_id': g.request_id}
        )
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
    logger.info("Search %r page %d returned %d results", query, page, len(formatted))
    return jsonify({'results': formatted})


@app.route('/api/v1/songs/<int:song_id>', methods=['GET'])
def song_definition(song_id):
    """Stream the song's definition as server-sent events.

    Emits `progress` events ({message}) as each stage starts, then a single
    `result` (the song) or `failure` ({msg, status, request_id}) event.
    """
    events = queue.Queue()
    request_id = g.request_id
    flask_app = app._get_current_object()

    def emit(event, data):
        events.put((event, data))

    def job():
        request_id_var.set(request_id)
        with flask_app.app_context():
            try:
                emit('result', get_or_define_song(song_id, lambda message: emit('progress', {'message': message})))
            except DefinitionError as e:
                emit('failure', {'msg': e.message, 'status': e.status, 'request_id': request_id})
            except Exception:
                logger.exception("Unexpected error defining song %s", song_id)
                emit('failure', {'msg': "Something went wrong on our side.", 'status': 500, 'request_id': request_id})

    # A separate thread so the definition still finishes (and is cached) if the client disconnects
    threading.Thread(target=job, daemon=True).start()

    def stream():
        while True:
            event, data = events.get()
            yield f"event: {event}\ndata: {json.dumps(data)}\n\n"
            if event != 'progress':
                return

    return app.response_class(
        stream(),
        mimetype='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'},
    )
