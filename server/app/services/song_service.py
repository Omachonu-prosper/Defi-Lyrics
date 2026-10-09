import logging
import threading
import time
from collections import defaultdict
from datetime import datetime, timezone

import openai
import requests
from flask import current_app as app
from pymongo.errors import PyMongoError

from app.db import get_songs_collection
from app.services.definition_pipeline import define_song
from app.utils.genius_service import get_song
from app.utils.lyrics_scraper import scrape_genius_lyrics, is_section_marker, LyricsNotFoundError


logger = logging.getLogger(__name__)
_song_locks = defaultdict(threading.Lock)


class DefinitionError(Exception):
    """A failure with a message that is safe to show the user."""

    def __init__(self, message, status):
        super().__init__(message)
        self.message = message
        self.status = status


def _serialize(doc):
    doc = dict(doc)
    doc.pop('_id', None)
    if isinstance(doc.get('created_at'), datetime):
        doc['created_at'] = doc['created_at'].isoformat()
    return doc


def get_or_define_song(song_id, progress):
    """Return the song's definition, running the AI pipeline if it isn't cached.

    `progress(message)` is called as each stage starts. Raises DefinitionError on failure.
    """
    lock = _song_locks[song_id]
    if not lock.acquire(blocking=False):
        logger.info("Song %s is already being defined, waiting", song_id)
        progress("Someone else is defining this song right now, waiting for them to finish…")
        lock.acquire()
    try:
        return _get_or_define(song_id, progress)
    finally:
        lock.release()


def _get_or_define(song_id, progress):
    started = time.monotonic()
    progress("Checking if this song has been defined before…")
    try:
        songs = get_songs_collection()
        cached = songs.find_one({'genius_id': song_id})
    except PyMongoError:
        logger.exception("Database lookup failed for song %s", song_id)
        raise DefinitionError("Our database is unavailable right now.", 503)
    if cached:
        logger.info("Song %s served from cache", song_id)
        return {**_serialize(cached), 'cached': True, 'low_confidence': False}

    progress("Fetching song details from Genius…")
    try:
        song = get_song(song_id)
    except requests.RequestException:
        logger.exception("Genius lookup failed for song %s", song_id)
        raise DefinitionError("Couldn't reach Genius to look up this song.", 502)
    if song is None:
        logger.info("Song %s not found on Genius", song_id)
        raise DefinitionError("Genius doesn't know this song.", 404)
    logger.info("Song %s is %r by %s", song_id, song['title'], song['artist'])

    progress(f"Fetching the lyrics for “{song['title']}”…")
    try:
        all_lines = scrape_genius_lyrics(song['genius_url'])
    except LyricsNotFoundError as e:
        logger.warning("No lyrics for song %s at %s: %s", song_id, song['genius_url'], e)
        raise DefinitionError(str(e), 422)
    except requests.RequestException:
        logger.exception("Lyrics scrape failed for song %s at %s", song_id, song['genius_url'])
        raise DefinitionError("Couldn't fetch the lyrics from Genius.", 502)
    lyric_lines = [line for line in all_lines if not is_section_marker(line)]
    logger.info("Scraped %d lyric lines (%d section markers) for song %s",
                len(lyric_lines), len(all_lines) - len(lyric_lines), song_id)

    threshold = app.config['CONFIDENCE_THRESHOLD']
    try:
        definition, confidence = define_song(
            song,
            lyric_lines,
            api_key=app.config['OPENAI_API_KEY'],
            model=app.config['OPENAI_MODEL'],
            threshold=threshold,
            max_refinements=app.config['MAX_REFINEMENTS'],
            progress=progress,
        )
    except openai.AuthenticationError:
        logger.exception("OpenAI rejected the API key")
        raise DefinitionError("The AI service rejected our credentials.", 502)
    except openai.RateLimitError:
        logger.exception("OpenAI rate limit or quota exceeded")
        raise DefinitionError("The AI service is busy or out of quota. Try again shortly.", 503)
    except openai.APIError:
        logger.exception("OpenAI request failed for song %s", song_id)
        raise DefinitionError("The AI service returned an error.", 502)
    if definition is None:
        logger.error("No attempt for song %s returned one entry per lyric line", song_id)
        raise DefinitionError("The AI couldn't produce a complete definition for this song.", 502)

    # Re-insert section markers between the defined lines
    defined = iter(definition.lines)
    lines = [
        {'text': line, 'section': True} if is_section_marker(line)
        else {**next(defined).model_dump(), 'text': line, 'section': False}
        for line in all_lines
    ]

    doc = {
        **song,
        'detected_language': definition.detected_language,
        'context': definition.context,
        'overall_meaning': definition.overall_meaning,
        'lines': lines,
        'confidence': confidence,
        'model': app.config['OPENAI_MODEL'],
        'created_at': datetime.now(timezone.utc),
    }
    low_confidence = confidence < threshold
    if low_confidence:
        logger.warning("Song %s best confidence %.2f is below %.2f, returning without saving",
                       song_id, confidence, threshold)
    else:
        progress("Saving the definition…")
        try:
            songs.insert_one(dict(doc))
        except PyMongoError:
            # The user still gets their definition, it just isn't cached
            logger.exception("Failed to save definition for song %s", song_id)

    logger.info("Song %s defined in %.1fs (confidence %.2f)", song_id, time.monotonic() - started, confidence)
    return {**_serialize(doc), 'cached': False, 'low_confidence': low_confidence}
