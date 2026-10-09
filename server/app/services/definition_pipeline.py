import logging
import time

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field


logger = logging.getLogger(__name__)


class LineDefinition(BaseModel):
    text: str = Field(description="The lyric line exactly as given")
    meaning: str = Field(description="What the line means, including slang, idioms and references")
    translation: str = Field(description="English translation; identical to the line if it is already English")


class SongDefinition(BaseModel):
    detected_language: str = Field(description="Main language(s) of the lyrics")
    context: str = Field(description="Artist background, cultural references, slang and setting needed to understand the song")
    overall_meaning: str = Field(description="The overall meaning of the song")
    lines: list[LineDefinition] = Field(description="One entry per numbered input line, in the same order")


class Evaluation(BaseModel):
    confidence: float = Field(ge=0, le=1, description="Confidence from 0 to 1 that the definition is accurate and complete")
    critique: str = Field(description="Specific problems to fix; empty if none")


GENERATE_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are Defi-Lyrics, an expert in music, lyrics, slang and cultures worldwide. "
     "You explain what song lyrics mean and translate them to English. "
     "First build the context needed to understand the song, then the overall meaning, "
     "then a meaning and English translation for every numbered line. "
     "Return exactly one entry per numbered line, in order, copying each line's text verbatim. "
     "If a line is already English, its translation must equal the line. "
     "Do not invent facts; if something is ambiguous, say so in the meaning."),
    ("human",
     "Song: {title}\nArtist: {artist}\nAlbum: {album}\nReleased: {release_date}\n\n"
     "Lyrics:\n{lyrics}{feedback}"),
])

EVALUATE_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are a strict reviewer of lyric explanations. Judge the definition for factual accuracy, "
     "correct interpretation of slang and cultural references, faithfulness of the English translations, "
     "and coverage of every line. Give a calibrated confidence between 0 and 1. "
     "Only give 0.8 or more if you would publish it as-is. List concrete issues in the critique."),
    ("human",
     "Song: {title} by {artist}\n\nLyrics:\n{lyrics}\n\nDefinition to review:\n{definition}"),
])


def _number_lines(lines):
    return "\n".join(f"{i + 1}. {line}" for i, line in enumerate(lines))


def define_song(song, lines, api_key, model, threshold, max_refinements, progress=lambda message: None):
    """Generate, self-evaluate and refine a song definition.

    `lines` are the lyric lines to define (no section markers).
    `progress(message)` is called as each step starts.
    Returns (definition: SongDefinition | None, confidence: float).
    """
    # No temperature: reasoning models (gpt-5, o-series) only accept the default
    llm = ChatOpenAI(api_key=api_key, model=model)
    generator = GENERATE_PROMPT | llm.with_structured_output(SongDefinition)
    evaluator = EVALUATE_PROMPT | llm.with_structured_output(Evaluation)

    base = {
        'title': song['title'],
        'artist': song['artist'],
        'album': song.get('album') or 'Unknown',
        'release_date': song.get('release_date') or 'Unknown',
        'lyrics': _number_lines(lines),
    }

    best, best_confidence = None, 0.0
    feedback = ""
    attempts = max_refinements + 1
    for attempt in range(1, attempts + 1):
        progress(f"Explaining and translating {len(lines)} lines (attempt {attempt} of {attempts})…")
        started = time.monotonic()
        definition = generator.invoke({**base, 'feedback': feedback})
        definition_json = definition.model_dump_json(indent=2)
        logger.info("Attempt %d/%d: generated %d line definitions with %s in %.1fs",
                    attempt, attempts, len(definition.lines), model, time.monotonic() - started)

        if len(definition.lines) != len(lines):
            logger.warning("Attempt %d/%d: expected %d line definitions, got %d",
                           attempt, attempts, len(lines), len(definition.lines))
            feedback = (
                f"\n\nYour previous answer had {len(definition.lines)} line entries but there are "
                f"{len(lines)} lines. Return exactly one entry per line.\n\nPrevious answer:\n{definition_json}"
            )
            continue

        progress("Double-checking the explanation…")
        started = time.monotonic()
        evaluation = evaluator.invoke({**base, 'definition': definition_json})
        logger.info("Attempt %d/%d: confidence %.2f (threshold %.2f), reviewed in %.1fs",
                    attempt, attempts, evaluation.confidence, threshold, time.monotonic() - started)
        logger.debug("Attempt %d/%d critique: %s", attempt, attempts, evaluation.critique)

        if evaluation.confidence > best_confidence or best is None:
            best, best_confidence = definition, evaluation.confidence
        if evaluation.confidence >= threshold:
            break

        if attempt < attempts:
            progress(f"Only {evaluation.confidence:.0%} confident, below the {threshold:.0%} bar. Refining…")
        feedback = (
            f"\n\nA reviewer rated your previous answer {evaluation.confidence:.2f} confidence. "
            f"Fix these issues:\n{evaluation.critique}\n\nPrevious answer:\n{definition_json}"
        )

    return best, best_confidence
