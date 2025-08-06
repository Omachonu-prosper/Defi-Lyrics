import requests
from bs4 import BeautifulSoup

def extract_azlyrics(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to load page: {response.status_code}")

    soup = BeautifulSoup(response.text, "html.parser")

    # AZLyrics puts lyrics in a <div> with no class or ID, between some comments
    divs = soup.find_all("div")
    for div in divs:
        if div.get("class") is None and div.get("id") is None:
            text = div.get_text(strip=True, separator="\n")
            # Simple heuristic: real lyrics div has a decent length
            if len(text.splitlines()) > 5:
                return text

    raise Exception("Lyrics not found on AZLyrics page.")

# Example usage
if __name__ == "__main__":
    url = "https://www.azlyrics.com/lyrics/llona/comforter.html"
    try:
        print(f"🎵 Scraping: {url}")
        lyrics = extract_azlyrics(url)
        print("\n🎤 Lyrics:\n")
        print(lyrics)
    except Exception as e:
        print(f"❌ Error: {e}")
