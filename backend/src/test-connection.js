const axios = require("axios");
const https = require("https");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

async function testConnection() {
  const key = process.env.TMDB_API_KEY;
  console.log("Testing TMDB connection...");
  if (!key) { console.error("TMDB_API_KEY missing"); return; }

  try {
    const agent = new https.Agent({ family: 4 });
    const { data } = await axios.get(`https://api.themoviedb.org/3/movie/24428?api_key=${key}`, {
      httpsAgent: agent, timeout: 10000,
    });
    console.log("Connected. Movie:", data.title);
  } catch (err) {
    console.error("Failed:", err.code === "ETIMEDOUT" ? "Timeout — use a VPN" : err.message);
  }
}

testConnection();
