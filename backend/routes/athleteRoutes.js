const express = require("express");
const {
  getDashboard,
  updateProfile,
} = require("../controllers/athleteController");
const { authenticate, isAthlete } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication and athlete role
router.use(authenticate);
router.use(isAthlete);

// Athlete routes
router.get("/dashboard", getDashboard);
router.put("/profile", updateProfile);

module.exports = router;
