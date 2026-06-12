const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const config = require("../config");

function generateToken(id) {
  return jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function cookieOptions() {
  const prod = config.isProduction;
  return {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: prod,
    sameSite: prod ? "None" : "Lax",
  };
}

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashed });
    if (!user) return res.status(400).json({ success: false, message: "Invalid user data" });

    const token = generateToken(user._id);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.cookie("token", token, cookieOptions())
      .status(201).json({ success: true, data: safeUser });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.cookie("token", token, cookieOptions()).json({ success: true, data: safeUser });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authorized" });
  res.json({ success: true, data: req.user });
};

exports.updateHistory = async (req, res) => {
  try {
    const { contentId, onModel, progress, duration, season, episode } = req.body;
    if (!contentId || !onModel) {
      return res.status(400).json({ success: false, message: "Missing contentId or onModel" });
    }

    let contentMetadata;
    if (onModel.toLowerCase().includes("movie")) {
      contentMetadata = await Movie.findById(contentId);
    } else {
      contentMetadata = await Series.findById(contentId);
    }
    if (!contentMetadata) return res.status(404).json({ success: false, message: "Content not found" });

    let displayPoster = contentMetadata.poster_path;
    let epStill = "";

    if (onModel.toLowerCase().includes("series") && season) {
      const targetSeason = contentMetadata.seasons?.find(s => s.season_number === Number(season));
      if (targetSeason) {
        if (targetSeason.poster_path) displayPoster = targetSeason.poster_path;
        const targetEpisode = targetSeason.episodes?.find(e => e.episode_number === Number(episode));
        if (targetEpisode) epStill = targetEpisode.still_path;
      }
    }

    const historyItem = {
      contentId: new mongoose.Types.ObjectId(contentId),
      title: contentMetadata.title || contentMetadata.name,
      poster_path: displayPoster,
      episodePoster: epStill,
      vote_average: contentMetadata.vote_average,
      onModel,
      progress: progress || 0,
      duration: duration || 0,
      season: season ? Number(season) : undefined,
      episode: episode ? Number(episode) : undefined,
      lastWatched: new Date(),
    };

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { watchHistory: { contentId: new mongoose.Types.ObjectId(contentId) } },
    });

    const updated = await User.findByIdAndUpdate(req.user.id, {
      $push: { watchHistory: { $each: [historyItem], $position: 0, $slice: 50 } },
    }, { new: true, select: "watchHistory" });

    res.json({ success: true, data: updated?.watchHistory || [] });
  } catch (error) {
    console.error("History Update Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: config.isProduction,
    sameSite: config.isProduction ? "None" : "Lax",
  });
  res.json({ success: true, message: "Logged out" });
};
