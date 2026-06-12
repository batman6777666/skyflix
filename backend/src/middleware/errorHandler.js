const config = require("../config");

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${status} - ${message}`);

  if (config.isProduction) {
    res.status(status).json({
      success: false,
      message: status === 500 ? "Internal Server Error" : message,
    });
  } else {
    res.status(status).json({
      success: false,
      message,
      stack: err.stack,
    });
  }
}

module.exports = { notFoundHandler, errorHandler };
