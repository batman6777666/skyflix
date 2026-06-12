const axios = require("axios");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const config = require("../config");

const TMDB_BASE = config.tmdb.baseUrl;
const API_KEY = config.tmdb.apiKey;

function cleanTitle(raw) {
  if (!raw) return "";
  let t = raw;
  t = t.replace(/\{.*?\}/g, "").replace(/\[.*?\]/g, "").replace(/\(\d{4}\)/g, "");
  t = t.replace(/(\.| )?(mkv|mp4|avi|webm|flv)/gi, "");
  t = t.replace(/\b(1080p|720p|480p|2160p|4k|HDCAM|WEB-DL|WEBRip|Bluray|DVDRip|ESub|Dual\sAudio|Hindi|English|x264|x265|HEVC|AAC|H\.264|SKYFLIX|SkyFlix)\b/gi, "");
  t = t.replace(/S\d{1,2}|Season\s?\d{1,2}|E\d{1,2}|Episode\s?\d{1,2}|\d{1,2}x\d{1,2}/gi, "");
  t = t.replace(/[.\-_]/g, " ");
  return t.replace(/\s+/g, " ").trim();
}

function extractYear(raw) {
  const m = raw.match(/[(\[.\s](\d{4})[)\].\s]/);
  return m ? m[1] : null;
}

async function processItem(item) {
  const isSeries = !!item.seasons;
  const rawName = isSeries ? item.name : item.title;
  const query = cleanTitle(rawName);
  if (!query) return null;
  const searchYear = item.releaseYear || extractYear(rawName);
  let modified = false;

  try {
    if (!item.tmdbId || item.tmdbId === "MANUAL_CHECK") {
      const type = isSeries ? "tv" : "movie";
      let url = `${TMDB_BASE}/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=true`;
      if (searchYear) url += isSeries ? `&first_air_date_year=${searchYear}` : `&year=${searchYear}`;

      let res = await axios.get(url);
      if (res.data.results.length === 0 && searchYear) {
        res = await axios.get(`${TMDB_BASE}/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=true`);
      }

      if (res.data.results?.length > 0) {
        const match = res.data.results[0];
        item.tmdbId = match.id;
        item.genre_ids = match.genre_ids || [];
        item.vote_average = match.vote_average;
        if (isSeries && match.first_air_date) item.first_air_date = match.first_air_date;
        if (!isSeries && match.release_date) {
          item.release_date = match.release_date;
          item.releaseYear = parseInt(match.release_date.split("-")[0]);
        }
        if (!item.poster_path) item.poster_path = match.poster_path ? "https://image.tmdb.org/t/p/w500" + match.poster_path : "";
        if (!item.backdrop_path) item.backdrop_path = match.backdrop_path ? "https://image.tmdb.org/t/p/original" + match.backdrop_path : "";
        if (!item.overview) item.overview = match.overview;
        modified = true;
      } else {
        item.tmdbId = "MANUAL_CHECK";
        await item.save();
        return `NO_MATCH: ${query}`;
      }
    }

    if (item.tmdbId && item.tmdbId !== "MANUAL_CHECK") {
      const currentOverview = (item.overview || "").trim();
      const needsUpdate = !currentOverview || currentOverview === "Syncing metadata..." || currentOverview === "Fetching details...";
      if (needsUpdate) {
        const type = isSeries ? "tv" : "movie";
        const detailUrl = `${TMDB_BASE}/${type}/${item.tmdbId}?api_key=${API_KEY}&append_to_response=keywords,credits,content_ratings,release_dates`;
        const { data: details } = await axios.get(detailUrl);

        if (details.overview) { item.overview = details.overview; modified = true; }
        if (isSeries && details.first_air_date) { item.first_air_date = details.first_air_date; modified = true; }
        if (!isSeries && details.release_date) { item.release_date = details.release_date; item.releaseYear = parseInt(details.release_date.split("-")[0]); modified = true; }
        if (details.original_language) { item.original_language = details.original_language; modified = true; }
        if (details.production_companies) {
          item.production_companies = details.production_companies.map(c => ({ name: c.name, id: c.id, logo_path: c.logo_path }));
          modified = true;
        }
        if (details.credits) {
          item.credits = {
            cast: (details.credits.cast || []).slice(0, 10).map(c => ({ id: c.id, name: c.name, character: c.character, profile_path: c.profile_path })),
            crew: (details.credits.crew || []).filter(c => ["Director", "Writer", "Executive Producer"].includes(c.job)).slice(0, 5).map(c => ({ id: c.id, name: c.name, job: c.job, profile_path: c.profile_path })),
          };
          modified = true;
        }
        if (details.keywords) {
          const kws = details.keywords.results || details.keywords.keywords;
          if (kws) { item.keywords = kws.map(k => ({ name: k.name, id: k.id })); modified = true; }
        }
        if (!isSeries && details.belongs_to_collection) {
          item.collectionInfo = { id: details.belongs_to_collection.id, name: details.belongs_to_collection.name, poster_path: details.belongs_to_collection.poster_path ? "https://image.tmdb.org/t/p/w500" + details.belongs_to_collection.poster_path : "", backdrop_path: details.belongs_to_collection.backdrop_path ? "https://image.tmdb.org/t/p/original" + details.belongs_to_collection.backdrop_path : "" };
          modified = true;
        }
        const rating = isSeries
          ? details.content_ratings?.results?.find(r => r.iso_3166_1 === "US")?.rating || null
          : details.release_dates?.results?.find(r => r.iso_3166_1 === "US")?.release_dates?.find(d => d.certification)?.certification || null;
        if (rating) { item.content_rating = rating; modified = true; }
      }
    }

    if (isSeries && item.tmdbId && item.tmdbId !== "MANUAL_CHECK") {
      await Promise.all((item.seasons || []).map(async (season) => {
        try {
          const { data: seasonData } = await axios.get(`${TMDB_BASE}/tv/${item.tmdbId}/season/${season.season_number}?api_key=${API_KEY}`);
          (season.episodes || []).forEach(localEp => {
            const realEp = (seasonData.episodes || []).find(t => t.episode_number === localEp.episode_number);
            if (realEp) {
              if (!localEp.name || /^Episode \d+$/i.test(localEp.name)) { localEp.name = realEp.name; modified = true; }
              if (!localEp.overview) { localEp.overview = realEp.overview; modified = true; }
              if (!localEp.still_path) { localEp.still_path = realEp.still_path ? "https://image.tmdb.org/t/p/w500" + realEp.still_path : ""; modified = true; }
            }
          });
        } catch {}
      }));
    }

    if (modified) {
      if (isSeries) { item.markModified("seasons"); }
      item.markModified("credits");
      item.markModified("production_companies");
      item.markModified("keywords");
      await item.save();
      return `UPDATED: ${query}`;
    }
    return null;
  } catch (err) {
    return `ERROR ${query}: ${err.message}`;
  }
}

async function runMetadataSync() {
  console.log("Starting metadata sync...");
  const processedIds = new Set();
  let total = 0;
  let running = true;

  while (running) {
    const batch = await Promise.all([
      Series.find({
        _id: { $nin: [...processedIds] },
        $or: [
          { tmdbId: null }, { tmdbId: "MANUAL_CHECK" },
          { overview: { $in: [null, "", "Syncing metadata..."] } },
        ],
      }).limit(30),
      Movie.find({
        _id: { $nin: [...processedIds] },
        $or: [
          { tmdbId: null }, { tmdbId: "MANUAL_CHECK" },
          { overview: { $in: [null, "", "Syncing metadata..."] } },
        ],
      }).limit(30),
    ]);

    const items = [...batch[0], ...batch[1]];
    if (!items.length) { running = false; break; }

    items.forEach(i => processedIds.add(i._id.toString()));
    const results = await Promise.all(items.map(i => processItem(i)));
    const logs = results.filter(Boolean);
    total += logs.length;
    if (logs.length) console.log(logs.join("\n"));
  }

  console.log(`Metadata sync complete. Processed: ${total}`);
}

module.exports = { processItem, runMetadataSync };
