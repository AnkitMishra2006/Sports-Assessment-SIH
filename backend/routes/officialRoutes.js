const express = require("express");
const {
  getDashboard,
  getSubmissions,
  reviewSubmission,
} = require("../controllers/officialController");
const { authenticate, isOfficial } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication and official role
router.use(authenticate);
router.use(isOfficial);

// Official routes
router.get("/dashboard", getDashboard);
router.get("/submissions", getSubmissions);
router.put("/submissions/:submissionId/review", reviewSubmission);

module.exports = router;
