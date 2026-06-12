const axios = require("axios");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

async function debug() {
  const apiKey = process.env.RPMSHARE_API_KEY;
  console.log("RPMShare API Key:", apiKey ? "Loaded" : "MISSING");
  if (!apiKey) { console.error("Add RPMSHARE_API_KEY to .env"); return; }

  try {
    const { data } = await axios.get("https://rpmshare.com/api/v1/video/manage?perPage=5", {
      headers: { "api-token": apiKey, Accept: "application/json" },
    });
    console.log("Status:", data);
  } catch (err) {
    console.error("Error:", err.response?.status, err.response?.data || err.message);
  }
}

debug();
