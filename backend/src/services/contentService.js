const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const Series = require("../models/Series");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

async function attachFileData(items) {
  if (!isDbConnected()) return items;

  const movieIds = items.filter(i => i.type === "Movie").map(i => String(i.id));
  const seriesIds = items.filter(i => i.type === "Series").map(i => String(i.id));

  let dbMovies = [], dbSeries = [];
  try {
    [dbMovies, dbSeries] = await Promise.all([
      movieIds.length > 0
        ? Movie.find({ tmdbId: { $in: movieIds } }).select("fileCode embedCode downloadLink tmdbId title").lean()
        : [],
      seriesIds.length > 0
        ? Series.find({ tmdbId: { $in: seriesIds } }).select("name tmdbId seasons").lean()
        : [],
    ]);
  } catch {
    console.warn("MongoDB unavailable, returning TMDB data without file links");
  }

  const movieMap = {};
  dbMovies.forEach(m => { if (m.tmdbId) movieMap[m.tmdbId] = m; });
  const seriesMap = {};
  dbSeries.forEach(s => { if (s.tmdbId) seriesMap[s.tmdbId] = s; });

  return items.map(item => {
    if (item.type === "Movie") {
      const match = movieMap[String(item.id)];
      if (match) return { ...item, fileCode: match.fileCode, embedCode: match.embedCode, downloadLink: match.downloadLink };
    }
    if (item.type === "Series") {
      const match = seriesMap[String(item.id)];
      if (match) return { ...item, seasons: match.seasons || [] };
    }
    return item;
  });
}

async function attachMovieFileData(movie) {
  if (!isDbConnected()) return movie;

  try {
    const dbMovie = await Movie.findOne({ tmdbId: String(movie.id) }).select("fileCode embedCode downloadLink").lean();
    if (dbMovie) {
      movie.fileCode = dbMovie.fileCode;
      movie.embedCode = dbMovie.embedCode;
      movie.downloadLink = dbMovie.downloadLink;
    }
  } catch {
    console.warn("MongoDB unavailable for movie details");
  }
  return movie;
}

async function mergeSeriesFileData(tmdbDetails) {
  if (!isDbConnected()) return tmdbDetails;

  let dbSeries;
  try {
    dbSeries = await Series.findOne({ tmdbId: String(tmdbDetails.id) }).select("seasons").lean();
  } catch {
    console.warn("MongoDB unavailable for series details");
    return tmdbDetails;
  }
  if (!dbSeries?.seasons) return tmdbDetails;

  const mergedSeasons = (tmdbDetails.seasons || []).map(s => {
    const dbSeason = dbSeries.seasons.find(ds => ds.season_number === s.season_number);
    if (!dbSeason?.episodes) return s;
    return {
      ...s,
      episodes: (s.episodes || []).map(ep => {
        const dbEp = dbSeason.episodes.find(de => de.episode_number === ep.episode_number);
        if (!dbEp) return ep;
        return { ...ep, fileCode: dbEp.fileCode || "", embedCode: dbEp.embedCode || "", downloadLink: dbEp.downloadLink || "" };
      }),
    };
  });

  return { ...tmdbDetails, seasons: mergedSeasons };
}

module.exports = { attachFileData, attachMovieFileData, mergeSeriesFileData };
