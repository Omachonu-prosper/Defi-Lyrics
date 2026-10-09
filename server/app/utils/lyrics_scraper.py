import re
import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
}
SECTION_RE = re.compile(r"^\[.*\]$")


class LyricsNotFoundError(Exception):
    pass


def is_section_marker(line):
    return bool(SECTION_RE.match(line))


def scrape_genius_lyrics(url):
    """Scrape a Genius song page and return its lyrics as a list of lines.

    Section markers like "[Verse 1]" are kept as their own lines.
    """
    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    containers = soup.select('div[data-lyrics-container="true"]')
    if not containers:
        raise LyricsNotFoundError("Lyrics not found on Genius page.")

    lines = []
    for container in containers:
        # Genius injects headers/annotations that aren't part of the lyrics
        for node in container.select('[data-exclude-from-selection="true"]'):
            node.decompose()
        for br in container.find_all("br"):
            br.replace_with("\n")
        text = container.get_text()
        lines.extend(line.strip() for line in text.split("\n"))

    lines = [line for line in lines if line]
    if not any(not is_section_marker(line) for line in lines):
        raise LyricsNotFoundError("Song has no lyrics.")
    return lines
