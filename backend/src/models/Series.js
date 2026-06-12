const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  episode_number: { type: Number, required: true },
  name: { type: String, default: "" },
  overview: { type: String, default: "" },
  still_path: { type: String, default: "" },
  fileCode: { type: String, default: "" },
  embedCode: { type: String, default: "" },
  downloadLink: { type: String, default: "" },
  air_date: { type: String, default: "" },
  vote_average: { type: Number, default: 0 },
});

const seasonSchema = new mongoose.Schema({
  season_number: { type: Number, required: true },
  name: { type: String, default: "" },
  overview: { type: String, default: "" },
  poster_path: { type: String, default: "" },
  air_date: { type: String, default: "" },
  episode_count: { type: Number, default: 0 },
  episodes: [episodeSchema],
});

const seriesSchema = new mongoose.Schema({
  tmdbId: { type: String, default: null },
  name: { type: String, default: "" },
  title: { type: String, default: "" },
  overview: { type: String, default: "" },
  poster_path: { type: String, default: "" },
  backdrop_path: { type: String, default: "" },
  first_air_date: { type: String, default: "" },
  vote_average: { type: Number, default: 0 },
  genre_ids: [{ type: Number }],
  genres: [{ type: String }],
  seasons: [seasonSchema],
  original_language: { type: String, default: "" },
  production_companies: [{ name: String, id: Number, logo_path: String }],
  credits: {
    cast: [{ id: Number, name: String, character: String, profile_path: String }],
    crew: [{ id: Number, name: String, job: String, profile_path: String }],
  },
  keywords: [{ name: String, id: Number }],
  content_rating: { type: String, default: "" },
  releaseYear: { type: Number, default: null },
}, { timestamps: true });

seriesSchema.index({ tmdbId: 1 }, { unique: true, sparse: true });
seriesSchema.index({ name: 1 });
seriesSchema.index({ "seasons.season_number": 1 });

module.exports = mongoose.model("Series", seriesSchema);
