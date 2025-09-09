const { verifyToken } = require("../utils/jwt");
const Athlete = require("../models/Athlete");
const Official = require("../models/Official");

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided",
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: "Invalid token",
      message: "Token is not valid",
    });
  }
};

// Middleware to check if user is athlete
const isAthlete = (req, res, next) => {
  if (req.user.userType !== "athlete") {
    return res.status(403).json({
      error: "Access denied",
      message: "Athletes only",
    });
  }
  next();
};

// Middleware to check if user is official
const isOfficial = (req, res, next) => {
  if (req.user.userType !== "official") {
    return res.status(403).json({
      error: "Access denied",
      message: "Officials only",
    });
  }
  next();
};

module.exports = {
  authenticate,
  isAthlete,
  isOfficial,
};
