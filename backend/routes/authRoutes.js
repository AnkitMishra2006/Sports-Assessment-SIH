const express = require("express");
const {
  registerAthlete,
  loginAthlete,
  registerOfficial,
  loginOfficial,
  getProfile,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Athlete routes
router.post("/athlete/register", registerAthlete);
router.post("/athlete/login", loginAthlete);

// Official routes
router.post("/official/register", registerOfficial);
router.post("/official/login", loginOfficial);

// Protected routes
router.get("/profile", authenticate, getProfile);

module.exports = router;
