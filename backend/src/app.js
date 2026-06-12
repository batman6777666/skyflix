const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("short"));

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = config.cors.allowedOrigins.some(a => {
      if (!a) return false;
      return origin.includes(a) || origin.includes("localhost") ||
        origin.endsWith(".vercel.app") || origin.endsWith(".qzz.io") ||
        origin.endsWith(".cloudflare.com");
    });
    if (allowed) return cb(null, true);
    console.log("CORS Blocked:", origin);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

mongoose.connect(config.mongo.uri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok", uptime: process.uptime() });
});

app.get("/", (_req, res) => {
  res.json({ success: true, name: "Skyflix API", version: "2.0.0" });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Skyflix API running on port ${config.port} [${config.nodeEnv}]`);
});

module.exports = app;
