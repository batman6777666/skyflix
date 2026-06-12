const mongoose = require("mongoose");
const { attachFileData, attachMovieFileData, mergeSeriesFileData } = require("../services/contentService");
const {
  fetchTrending, fetchTrendingMovies, fetchTrendingTV,
  fetchPopularMovies, fetchPopularTV, fetchTopRatedMovies, fetchTopRatedTV,
  fetchNowPlaying, fetchUpcoming, fetchAiringToday, fetchOnTheAir,
  fetchLatestMovies, fetchLatestTV,
  fetchRecommendations, searchMulti,
  fetchMovieDetails, fetchTVDetails,
  fetchMovieGenres, fetchTVGenres,
  fetchTVSeasonEpisodes, tmdbGet,
} = require("../services/tmdb");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const Request = require("../models/Request");

let homeCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000;

const tvDetailsCache = new Map();
const TV_CACHE_TTL = 30 * 60 * 1000;
const TV_CACHE_MAX = 100;

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

exports.getHomeContent = async (req, res) => {
  try {
    if (homeCache && Date.now() - lastCacheTime < CACHE_TTL) {
      return res.json(homeCache);
    }

    const [
      trendingAll, trendingMovies, trendingTV,
      popularMovies, popularTV, topMovies, topTV,
      nowPlaying, upcoming, airingToday, onTheAir,
      genres, tvGenres,
    ] = await Promise.all([
      fetchTrending("week", 1),
      fetchTrendingMovies("week", 1),
      fetchTrendingTV("week", 1),
      fetchPopularMovies(1), fetchPopularTV(1),
      fetchTopRatedMovies(1), fetchTopRatedTV(1),
      fetchNowPlaying(1), fetchUpcoming(1),
      fetchAiringToday(1), fetchOnTheAir(1),
      fetchMovieGenres(), fetchTVGenres(),
    ]);

    const genreMap = {};
    [...genres, ...tvGenres].forEach(g => { genreMap[g.id] = g.name; });

    const sections = [];

    if (trendingMovies.data.length) sections.push({ title: "Trending Movies", data: trendingMovies.data.slice(0, 20) });
    if (trendingTV.data.length) sections.push({ title: "Trending Series", data: trendingTV.data.slice(0, 20) });
    if (nowPlaying.data.length) sections.push({ title: "Now Playing", data: nowPlaying.data.slice(0, 20) });
    if (popularMovies.data.length) sections.push({ title: "Popular Movies", data: popularMovies.data.slice(0, 20) });
    if (popularTV.data.length) sections.push({ title: "Popular Series", data: popularTV.data.slice(0, 20) });

    const genreSections = [
      { id: "28", label: "Action" }, { id: "35", label: "Comedy" },
      { id: "27", label: "Horror" }, { id: "18", label: "Drama" },
      { id: "53", label: "Thriller" }, { id: "878", label: "Sci-Fi" },
      { id: "10749", label: "Romance" }, { id: "16", label: "Animation" },
      { id: "99", label: "Documentary" },
    ];
    genreSections.forEach(({ id, label }) => {
      const filtered = popularMovies.data.filter(m => m.genre_ids.includes(id));
      if (filtered.length) sections.push({ title: `${label} Movies`, data: filtered.slice(0, 20) });
    });

    const tvGenreSections = [
      { id: "18", label: "Drama Series" }, { id: "35", label: "Comedy Series" },
      { id: "80", label: "Crime Series" }, { id: "9648", label: "Mystery Series" },
      { id: "16", label: "Animated Series" },
    ];
    tvGenreSections.forEach(({ id, label }) => {
      const filtered = popularTV.data.filter(m => m.genre_ids.includes(id));
      if (filtered.length) sections.push({ title: label, data: filtered.slice(0, 20) });
    });

    if (topMovies.data.length) sections.push({ title: "Top Rated Movies", data: topMovies.data.slice(0, 20) });
    if (topTV.data.length) sections.push({ title: "Top Rated Series", data: topTV.data.slice(0, 20) });
    if (upcoming.data.length) sections.push({ title: "Upcoming Releases", data: upcoming.data.slice(0, 20) });
    if (airingToday.data.length) sections.push({ title: "Airing Today", data: airingToday.data.slice(0, 20) });
    if (onTheAir.data.length) sections.push({ title: "Currently Airing", data: onTheAir.data.slice(0, 20) });

    const banner = trendingMovies.data.slice(0, 6);
    const payload = { banner, sections };

    homeCache = payload;
    lastCacheTime = Date.now();

    res.json(payload);
  } catch (error) {
    console.error("Home Content Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const sort = req.query.sort || "popular";

    let result;
    if (sort === "latest") {
      result = await fetchLatestMovies(page);
    } else if (req.query.genre) {
      const data = await tmdbGet("/discover/movie", {
        with_genres: req.query.genre, page, sort_by: "popularity.desc",
      });
      result = { data: (data.results || []).map(m => require("../services/tmdb").normalizeMovie(m)), totalPages: data.total_pages || 1 };
    } else {
      result = await fetchPopularMovies(page);
    }

    const items = await attachFileData(result.data.slice(0, limit));
    res.json({ data: items, totalPages: result.totalPages, page });
  } catch (error) {
    console.error("Movies Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSeries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const sort = req.query.sort || "popular";

    let result;
    if (sort === "latest") {
      result = await fetchLatestTV(page);
    } else if (req.query.genre) {
      const data = await tmdbGet("/discover/tv", {
        with_genres: req.query.genre, page, sort_by: "popularity.desc",
      });
      result = { data: (data.results || []).map(m => require("../services/tmdb").normalizeTV(m)), totalPages: data.total_pages || 1 };
    } else {
      result = await fetchPopularTV(page);
    }

    const items = await attachFileData(result.data.slice(0, limit));
    res.json({ data: items, totalPages: result.totalPages, page });
  } catch (error) {
    console.error("Series Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchContent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) return res.json([]);
    const result = await searchMulti(query, 1);
    const items = await attachFileData(result.data);
    res.json(items);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await fetchMovieDetails(id);
    const enriched = await attachMovieFileData(details);
    res.json(enriched);
  } catch (error) {
    console.error("Movie Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTVDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const cached = tvDetailsCache.get(id);
    if (cached && Date.now() - cached.ts < TV_CACHE_TTL) {
      return res.json(cached.data);
    }

    if (isDbConnected()) {
      const dbSeries = await Series.findOne({ tmdbId: String(id) }).lean();
      const hasDbEpisodes = dbSeries?.seasons?.some(s => s.episodes?.some(e => e.fileCode));
      if (dbSeries && hasDbEpisodes) {
        const details = {
          id: Number(dbSeries.tmdbId),
          title: dbSeries.name,
          name: dbSeries.name,
          overview: dbSeries.overview || "",
          poster_path: dbSeries.poster_path,
          backdrop_path: dbSeries.backdrop_path,
          vote_average: dbSeries.vote_average || 0,
          first_air_date: dbSeries.first_air_date || "",
          genre_ids: dbSeries.genre_ids || [],
          type: "Series",
          seasons: (dbSeries.seasons || []).map(s => ({
            season_number: s.season_number,
            name: s.name || `Season ${s.season_number}`,
            poster_path: s.poster_path,
            episode_count: s.episodes?.length || 0,
            episodes: (s.episodes || []).map(ep => ({
              episode_number: ep.episode_number,
              name: ep.name || `Episode ${ep.episode_number}`,
              overview: ep.overview || "",
              still_path: ep.still_path,
              vote_average: ep.vote_average || 0,
              fileCode: ep.fileCode,
              embedCode: ep.embedCode,
              downloadLink: ep.downloadLink,
            })),
          })),
        };
        tvDetailsCache.set(id, { data: details, ts: Date.now() });
        if (tvDetailsCache.size > TV_CACHE_MAX) {
          const firstKey = tvDetailsCache.keys().next().value;
          tvDetailsCache.delete(firstKey);
        }
        return res.json(details);
      }
    }

    const [tmdbDetails, firstSeasonData] = await Promise.all([
      fetchTVDetails(id),
      fetchTVSeasonEpisodes(id, 1).catch(() => null),
    ]);

    if (firstSeasonData) {
      const seasonMeta = tmdbDetails.seasons?.find(s => s.season_number === firstSeasonData.season_number);
      if (seasonMeta) seasonMeta.episodes = firstSeasonData.episodes || [];
    }

    const merged = await mergeSeriesFileData(tmdbDetails);

    tvDetailsCache.set(id, { data: merged, ts: Date.now() });
    if (tvDetailsCache.size > TV_CACHE_MAX) {
      const firstKey = tvDetailsCache.keys().next().value;
      tvDetailsCache.delete(firstKey);
    }

    res.json(merged);
  } catch (error) {
    console.error("TV Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTVSeasonEpisodes = async (req, res) => {
  try {
    const { id, seasonNum } = req.params;
    const data = await fetchTVSeasonEpisodes(id, seasonNum);
    const merged = await mergeSeriesFileData({ id: Number(id), seasons: [data] });
    res.json(merged.seasons?.[0] || data);
  } catch (error) {
    console.error("TV Season Episodes Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSimilar = async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!["movie", "tv"].includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be 'movie' or 'tv'" });
    }
    const result = await fetchRecommendations(type, id, 1);
    const items = await attachFileData(result.data.slice(0, 8));
    res.json({ data: items });
  } catch (error) {
    console.error("Similar Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const [movieGenres, tvGenres] = await Promise.all([fetchMovieGenres(), fetchTVGenres()]);
    res.json({ movieGenres, tvGenres });
  } catch (error) {
    console.error("Genres Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestContent = async (req, res) => {
  try {
    const { title, year, platform } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    await Request.create({ title, year, platform });
    res.json({ success: true, message: "Request received" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
