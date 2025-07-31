import requests
from bs4 import BeautifulSoup


url = "https://www.google.com/search?q=Eminem+godzilla+lyrics"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://www.google.com/"
}
session = requests.Session()
session.headers.update(headers)
response = session.get(url, timeout=60)
response.raise_for_status()
page = response.text
print(page)