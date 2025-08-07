const API_BASE_URL = import.meta.env.VITE_DEFI_LYRICS_API_BASE_URL;

export async function searchSongs(query, page = 1, pageSize = 10) {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/search?query=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
  );
  if (!res.ok) throw new Error('Failed to fetch search results');
  const data = await res.json();
  return data.results;
}