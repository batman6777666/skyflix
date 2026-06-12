require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/skyflix",
  },

  tmdb: {
    apiKey: process.env.TMDB_API_KEY,
    accessToken: process.env.TMDB_ACCESS_TOKEN,
    baseUrl: "https://api.themoviedb.org/3",
    imageBase: "https://image.tmdb.org/t/p",
  },

  rpmshare: {
    apiKey: process.env.RPMSHARE_API_KEY,
    baseUrl: "https://rpmshare.com/api/v1",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "fallback_dev_secret_change_me",
    expiresIn: "30d",
  },

  cors: {
    allowedOrigins: [
      "http://localhost:5173",
      "http://localhost:4173",
      process.env.CLIENT_URL,
    ].filter(Boolean),
  },

  cache: {
    homeTtl: 60 * 60 * 1000,
    tvDetailsTtl: 30 * 60 * 1000,
    tvDetailsMax: 100,
  },
};

module.exports = config;
