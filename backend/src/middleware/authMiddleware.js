const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};

const adminGuard = (req, res, next) => {
  protect(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
  });
};

module.exports = { protect, adminGuard };
