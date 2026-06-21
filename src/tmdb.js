const TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const BASE  = "https://api.themoviedb.org/3";
const IMG   = "https://image.tmdb.org/t/p/w300";

const headers = { Authorization: `Bearer ${TOKEN}` };

// TMDB Japan watch provider ID → our service ID
const PROVIDER_MAP = {
  8:   "netflix",   // Netflix
  9:   "prime",     // Amazon Prime Video
  119: "prime",     // Amazon Prime Video (channels)
  337: "disney",    // Disney Plus
  433: "hulu",      // Hulu Japan
  49:  "unext",     // U-NEXT
  258: "unext",     // U-NEXT (alternate)
  57:  "hulu",      // Hulu (alternate)
  2:   "abema",     // Apple TV (fallback)
};

export function posterUrl(path) {
  return path ? `${IMG}${path}` : null;
}

export async function getPoster(id, mediaType) {
  const res = await fetch(`${BASE}/${mediaType}/${id}?language=ja-JP`, { headers });
  const data = await res.json();
  return posterUrl(data.poster_path);
}

export async function getSeasons(tvId) {
  const res = await fetch(`${BASE}/tv/${tvId}?language=ja-JP`, { headers });
  const data = await res.json();
  return (data.seasons || []).filter(s => s.season_number > 0);
}

export async function getEpisodes(tvId, seasonNumber) {
  const res = await fetch(`${BASE}/tv/${tvId}/season/${seasonNumber}?language=ja-JP`, { headers });
  const data = await res.json();
  return data.episodes || [];
}

export async function searchTitles(query) {
  if (!query || query.length < 2) return [];

  const [movies, shows] = await Promise.all([
    fetch(`${BASE}/search/movie?query=${encodeURIComponent(query)}&language=ja-JP&region=JP&page=1`, { headers }).then(r => r.json()),
    fetch(`${BASE}/search/tv?query=${encodeURIComponent(query)}&language=ja-JP&page=1`, { headers }).then(r => r.json()),
  ]);

  const movieResults = (movies.results || []).slice(0, 8).map(m => ({ ...m, media_type: "movie" }));
  const tvResults    = (shows.results  || []).slice(0, 5).map(t => ({ ...t, media_type: "tv" }));

  return [...movieResults, ...tvResults];
}

export async function getWatchProviders(id, mediaType) {
  const res = await fetch(`${BASE}/${mediaType}/${id}/watch/providers`, { headers });
  const data = await res.json();
  const jp = data.results?.JP;
  if (!jp) return { serviceId: null, url: null };

  const flatrate = jp.flatrate || [];
  for (const p of flatrate) {
    const serviceId = PROVIDER_MAP[p.provider_id];
    if (serviceId) return { serviceId, url: jp.link };
  }
  return { serviceId: null, url: jp.link || null };
}

export async function getTitleDetails(id, mediaType) {
  const [detail, providers] = await Promise.all([
    fetch(`${BASE}/${mediaType}/${id}?language=ja-JP`, { headers }).then(r => r.json()),
    getWatchProviders(id, mediaType),
  ]);

  const title = detail.title || detail.name || "";
  const year  = (detail.release_date || detail.first_air_date || "").slice(0, 4);
  const genres = (detail.genres || []).map(g => g.name).join("・");

  return {
    tmdbId:   id,
    title,
    type:     mediaType === "movie" ? "映画" : "ドラマ",
    year:     Number(year) || 0,
    genre:    genres || "—",
    duration: mediaType === "movie"
      ? (detail.runtime ? `${detail.runtime}分` : "—")
      : (detail.number_of_seasons ? `S${detail.number_of_seasons} ${detail.number_of_episodes}話` : "—"),
    poster:   posterUrl(detail.poster_path),
    desc:     detail.overview || "",
    service:  providers.serviceId,
    url:      providers.url,
    thumb:    mediaType === "movie" ? "🎬" : "🎭",
  };
}
