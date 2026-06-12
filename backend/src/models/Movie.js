const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  tmdbId: { type: String, default: null },
  title: { type: String, default: "" },
  overview: { type: String, default: "" },
  poster_path: { type: String, default: "" },
  backdrop_path: { type: String, default: "" },
  release_date: { type: String, default: "" },
  releaseYear: { type: Number, default: null },
  vote_average: { type: Number, default: 0 },
  genre_ids: [{ type: Number }],
  genres: [{ type: String }],
  fileCode: { type: String, default: "" },
  embedCode: { type: String, default: "" },
  downloadLink: { type: String, default: "" },
  original_language: { type: String, default: "" },
  production_companies: [{ name: String, id: Number, logo_path: String }],
  credits: {
    cast: [{ id: Number, name: String, character: String, profile_path: String }],
    crew: [{ id: Number, name: String, job: String, profile_path: String }],
  },
  keywords: [{ name: String, id: Number }],
  content_rating: { type: String, default: "" },
  collectionInfo: {
    id: Number,
    name: String,
    poster_path: String,
    backdrop_path: String,
  },
  vote_count: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
}, { timestamps: true });

movieSchema.index({ tmdbId: 1 }, { unique: true, sparse: true });
movieSchema.index({ title: 1 });
movieSchema.index({ releaseYear: -1 });

module.exports = mongoose.model("Movie", movieSchema);
