const axios = require("axios");
const config = require("../config");

const tmdbClient = axios.create({
  baseURL: config.tmdb.baseUrl,
  params: { api_key: config.tmdb.apiKey, language: "en-US" },
  timeout: 10000,
});

async function tmdbGet(endpoint, params = {}) {
  const { data } = await tmdbClient.get(endpoint, { params });
  return data;
}

function normalizeMovie(item) {
  return {
    id: item.id,
    title: item.title || item.original_title || "",
    overview: item.overview || "",
    poster_path: item.poster_path
      ? `${config.tmdb.imageBase}/w500${item.poster_path}`
      : "",
    backdrop_path: item.backdrop_path
      ? `${config.tmdb.imageBase}/original${item.backdrop_path}`
      : "",
    release_date: item.release_date || "",
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    genre_ids: (item.genre_ids || item.genres?.map(g => g.id) || []).map(String),
    popularity: item.popularity || 0,
    type: "Movie",
  };
}

function normalizeTV(item) {
  return {
    id: item.id,
    name: item.name || item.original_name || "",
    title: item.name || item.original_name || "",
    overview: item.overview || "",
    poster_path: item.poster_path
      ? `${config.tmdb.imageBase}/w500${item.poster_path}`
      : "",
    backdrop_path: item.backdrop_path
      ? `${config.tmdb.imageBase}/original${item.backdrop_path}`
      : "",
    first_air_date: item.first_air_date || "",
    vote_average: item.vote_average || 0,
    genre_ids: (item.genre_ids || item.genres?.map(g => g.id) || []).map(String),
    popularity: item.popularity || 0,
    type: "Series",
  };
}

async function fetchTrending(timeWindow = "week", page = 1) {
  const data = await tmdbGet(`/trending/all/${timeWindow}`, { page });
  return { data: (data.results || []).map(normalizeMovie), totalPages: data.total_pages || 1 };
}

async function fetchTrendingMovies(timeWindow = "week", page = 1) {
  const data = await tmdbGet(`/trending/movie/${timeWindow}`, { page });
  return { data: (data.results || []).map(normalizeMovie), totalPages: data.total_pages || 1 };
}

async function fetchTrendingTV(timeWindow = "week", page = 1) {
  const data = await tmdbGet(`/trending/tv/${timeWindow}`, { page });
  return { data: (data.results || []).map(normalizeTV), totalPages: data.total_pages || 1 };
}

async function fetchPopularMovies(page = 1) {
  const data = await tmdbGet("/movie/popular", { page });
  return { data: (data.results || []).map(normalizeMovie), totalPages: data.total_pages || 1 };
}

async function fetchPopularTV(page = 1) {
  const data = await tmdbGet("/tv/popular", { page });
  return { data: (data.results || []).map(normalizeTV), totalPages: data.total_pages || 1 };
}

async function fetchTopRatedMovies(page = 1) {
  const data = await tmdbGet("/movie/top_rated", { page });
  return { data: (data.results || []).map(normalizeMovie), totalPages: data.total_pages || 1 };
}

async function fetchTopRatedTV(page = 1) {
  const data = await tmdbGet("/tv/top_rated", { page });
  return { data: (data.results || []).map(normalizeTV), totalPages: data.total_pages || 1 };
}

async function fetchNowPlaying(page = 1) {
  const data = await tmdbGet("/movie/now_playing", { page });
  return { data: (data.results || []).map(normalizeMovie), totalPages: data.total_pages || 1 };
}

async function fetchUpcoming(page = 1) {
  const data = await tmdbGet("/movie/upcoming", { page });
  return { data: (data.results || []).map(normalizeMovie), totalPages: data.total_pages || 1 };
}

async function fetchAiringToday(page = 1) {
  const data = await tmdbGet("/tv/airing_today", { page });
  return { data: (data.results || []).map(normalizeTV), totalPages: data.total_pages || 1 };
}

async function fetchOnTheAir(page = 1) {
  const data = await tmdbGet("/tv/on_the_air", { page });
  return { data: (data.results || []).map(normalizeTV), totalPages: data.total_pages || 1 };
}

async function fetchLatestMovies(page = 1) {
  return fetchPopularMovies(page);
}

async function fetchLatestTV(page = 1) {
  return fetchPopularTV(page);
}

async function fetchRecommendations(type, id, page = 1) {
  const data = await tmdbGet(`/${type}/${id}/recommendations`, { page });
  const normalizer = type === "tv" ? normalizeTV : normalizeMovie;
  return { data: (data.results || []).map(normalizer), totalPages: data.total_pages || 1 };
}

async function searchMulti(query, page = 1) {
  const data = await tmdbGet("/search/multi", { query, page, include_adult: true });
  const all = (data.results || []).map(item => {
    if (item.media_type === "tv") return normalizeTV(item);
    if (item.media_type === "movie") return normalizeMovie(item);
    return null;
  }).filter(Boolean);
  return { data: all, totalPages: data.total_pages || 1 };
}

async function fetchMovieDetails(id) {
  const data = await tmdbGet(`/movie/${id}`, {
    append_to_response: "keywords,credits,release_dates,videos,recommendations",
  });
  return {
    id: data.id,
    title: data.title || "",
    overview: data.overview || "",
    poster_path: data.poster_path ? `${config.tmdb.imageBase}/w500${data.poster_path}` : "",
    backdrop_path: data.backdrop_path ? `${config.tmdb.imageBase}/original${data.backdrop_path}` : "",
    release_date: data.release_date || "",
    vote_average: data.vote_average || 0,
    vote_count: data.vote_count || 0,
    genres: (data.genres || []).map(g => ({ id: g.id, name: g.name })),
    genre_ids: (data.genres || []).map(g => g.id),
    original_language: data.original_language || "",
    budget: data.budget || 0,
    revenue: data.revenue || 0,
    runtime: data.runtime || 0,
    tagline: data.tagline || "",
    status: data.status || "",
    homepage: data.homepage || "",
    production_companies: (data.production_companies || []).map(c => ({
      id: c.id, name: c.name, logo_path: c.logo_path, origin_country: c.origin_country,
    })),
    credits: {
      cast: (data.credits?.cast || []).slice(0, 20).map(c => ({
        id: c.id, name: c.name, character: c.character,
        profile_path: c.profile_path ? `${config.tmdb.imageBase}/w185${c.profile_path}` : null,
      })),
      crew: (data.credits?.crew || []).filter(c =>
        ["Director", "Writer", "Executive Producer", "Producer"].includes(c.job)
      ).slice(0, 10).map(c => ({
        id: c.id, name: c.name, job: c.job,
        profile_path: c.profile_path ? `${config.tmdb.imageBase}/w185${c.profile_path}` : null,
      })),
    },
    keywords: (data.keywords?.keywords || data.keywords?.results || []).map(k => ({
      id: k.id, name: k.name,
    })),
    collectionInfo: data.belongs_to_collection ? {
      id: data.belongs_to_collection.id,
      name: data.belongs_to_collection.name,
      poster_path: data.belongs_to_collection.poster_path
        ? `${config.tmdb.imageBase}/w500${data.belongs_to_collection.poster_path}`
        : null,
      backdrop_path: data.belongs_to_collection.backdrop_path
        ? `${config.tmdb.imageBase}/original${data.belongs_to_collection.backdrop_path}`
        : null,
    } : null,
    content_rating: (() => {
      const us = data.release_dates?.results?.find(r => r.iso_3166_1 === "US");
      return us?.release_dates?.find(d => d.certification)?.certification || "";
    })(),
    type: "Movie",
  };
}

async function fetchTVDetails(id) {
  const data = await tmdbGet(`/tv/${id}`, {
    append_to_response: "keywords,credits,content_ratings,videos,recommendations",
  });

  const seasons = (data.seasons || [])
    .filter(s => s.season_number > 0)
    .map(s => ({
      season_number: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      overview: s.overview || "",
      poster_path: s.poster_path
        ? `${config.tmdb.imageBase}/w500${s.poster_path}`
        : null,
      air_date: s.air_date || "",
      episode_count: s.episode_count || 0,
      episodes: [],
    }));

  return {
    id: data.id,
    name: data.name || data.original_name || "",
    title: data.name || data.original_name || "",
    overview: data.overview || "",
    poster_path: data.poster_path ? `${config.tmdb.imageBase}/w500${data.poster_path}` : "",
    backdrop_path: data.backdrop_path
      ? `${config.tmdb.imageBase}/original${data.backdrop_path}`
      : "",
    first_air_date: data.first_air_date || "",
    vote_average: data.vote_average || 0,
    genres: (data.genres || []).map(g => ({ id: g.id, name: g.name })),
    genre_ids: (data.genres || []).map(g => g.id),
    seasons,
    number_of_seasons: data.number_of_seasons || 0,
    number_of_episodes: data.number_of_episodes || 0,
    status: data.status || "",
    type: "Series",
    created_by: (data.created_by || []).map(c => ({
      id: c.id, name: c.name,
      profile_path: c.profile_path
        ? `${config.tmdb.imageBase}/w185${c.profile_path}`
        : null,
    })),
    networks: (data.networks || []).map(n => ({
      id: n.id, name: n.name, logo_path: n.logo_path
        ? `${config.tmdb.imageBase}/w185${n.logo_path}`
        : null,
    })),
    credits: {
      cast: (data.credits?.cast || []).slice(0, 20).map(c => ({
        id: c.id, name: c.name, character: c.character,
        profile_path: c.profile_path ? `${config.tmdb.imageBase}/w185${c.profile_path}` : null,
      })),
      crew: (data.credits?.crew || []).filter(c =>
        ["Director", "Writer", "Executive Producer", "Producer"].includes(c.job)
      ).slice(0, 10).map(c => ({
        id: c.id, name: c.name, job: c.job,
        profile_path: c.profile_path ? `${config.tmdb.imageBase}/w185${c.profile_path}` : null,
      })),
    },
    content_rating: data.content_ratings?.results?.find(r => r.iso_3166_1 === "US")?.rating || "",
    keywords: (data.keywords?.results || data.keywords?.keywords || []).map(k => ({
      id: k.id, name: k.name,
    })),
  };
}

async function fetchTVSeasonEpisodes(id, seasonNumber) {
  const seasonData = await tmdbGet(`/tv/${id}/season/${seasonNumber}`);
  return {
    season_number: seasonNumber,
    name: seasonData.name || `Season ${seasonNumber}`,
    overview: seasonData.overview || "",
    poster_path: seasonData.poster_path
      ? `${config.tmdb.imageBase}/w500${seasonData.poster_path}`
      : null,
    air_date: seasonData.air_date || "",
    episode_count: seasonData.episodes?.length || 0,
    episodes: (seasonData.episodes || []).map(ep => ({
      episode_number: ep.episode_number,
      name: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview || "",
      still_path: ep.still_path
        ? `${config.tmdb.imageBase}/w500${ep.still_path}`
        : null,
      air_date: ep.air_date || "",
      vote_average: ep.vote_average || 0,
      fileCode: "",
      embedCode: "",
      downloadLink: "",
    })),
  };
}

async function fetchMovieGenres() {
  const data = await tmdbGet("/genre/movie/list");
  return data.genres || [];
}

async function fetchTVGenres() {
  const data = await tmdbGet("/genre/tv/list");
  return data.genres || [];
}

module.exports = {
  tmdbGet,
  normalizeMovie,
  normalizeTV,
  fetchTrending,
  fetchTrendingMovies,
  fetchTrendingTV,
  fetchPopularMovies,
  fetchPopularTV,
  fetchTopRatedMovies,
  fetchTopRatedTV,
  fetchNowPlaying,
  fetchUpcoming,
  fetchAiringToday,
  fetchOnTheAir,
  fetchLatestMovies,
  fetchLatestTV,
  fetchRecommendations,
  searchMulti,
  fetchMovieDetails,
  fetchTVDetails,
  fetchMovieGenres,
  fetchTVGenres,
  fetchTVSeasonEpisodes,
};
