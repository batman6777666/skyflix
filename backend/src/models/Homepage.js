const mongoose = require("mongoose");

const homepageSchema = new mongoose.Schema({
  bannerItems: [{
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    title: String,
    image: String,
    order: Number,
  }],
  categories: [{
    title: String,
    type: { type: String, enum: ["movie", "series", "mixed"] },
    tmdbCategory: String,
    tmdbGenre: String,
    order: Number,
    visible: { type: Boolean, default: true },
  }],
}, { timestamps: true });

module.exports = mongoose.model("Homepage", homepageSchema);
