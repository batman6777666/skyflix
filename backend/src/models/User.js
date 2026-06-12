const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  watchHistory: [{
    contentId: { type: mongoose.Schema.Types.ObjectId, refPath: "watchHistory.onModel" },
    title: String,
    episodeTitle: String,
    poster_path: String,
    episodePoster: String,
    vote_average: Number,
    onModel: { type: String, enum: ["Movie", "Series"] },
    progress: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    season: Number,
    episode: Number,
    lastWatched: { type: Date, default: Date.now },
  }],
  watchlist: [{
    id: String,
    type: { type: String, enum: ["Movie", "Series"] },
    title: String,
    poster_path: String,
    vote_average: Number,
    release_date: String,
    addedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
