const API_BASE_URL = import.meta.env.VITE_DEFI_LYRICS_API_BASE_URL;

export async function searchSongs(query, page = 1, pageSize = 10) {
  let res;
  try {
    res = await fetch(
      `${API_BASE_URL}/api/v1/search?query=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
    );
  } catch {
    throw new Error("Couldn't reach the Defi-Lyrics server. Is it running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const requestId = data.data?.request_id || res.headers.get('X-Request-ID');
    throw new Error(`${data.msg || 'Failed to fetch search results.'}${requestId ? ` (ref ${requestId})` : ''}`);
  }
  return data.results;
}

/**
 * Stream a song's definition. Calls onProgress({message}) as each stage starts,
 * then exactly one of onResult(song) or onError({msg, status, request_id}).
 * Returns a function that stops listening.
 */
export function streamSongDefinition(id, { onProgress, onResult, onError }) {
  const source = new EventSource(`${API_BASE_URL}/api/v1/songs/${id}`);
  let finished = false;
  const finish = () => {
    finished = true;
    source.close();
  };

  source.addEventListener('progress', (e) => onProgress(JSON.parse(e.data)));
  source.addEventListener('result', (e) => {
    finish();
    onResult(JSON.parse(e.data));
  });
  source.addEventListener('failure', (e) => {
    finish();
    onError(JSON.parse(e.data));
  });
  // Connection-level errors. Close instead of letting EventSource reconnect and rerun the pipeline.
  source.onerror = () => {
    if (finished) return;
    finish();
    onError({ msg: 'Lost connection to the Defi-Lyrics server. Is it running?' });
  };

  return finish;
}
