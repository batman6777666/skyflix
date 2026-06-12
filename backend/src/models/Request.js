const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: String, default: "" },
  platform: { type: String, default: "" },
  status: { type: String, enum: ["pending", "fulfilled", "rejected"], default: "pending" },
  userEmail: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);
