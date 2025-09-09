const Official = require("../models/Official");
const Submission = require("../models/Submission");

// Get official dashboard data
const getDashboard = async (req, res) => {
  try {
    const official = await Official.findById(req.user.userId).select(
      "-password"
    );

    if (!official) {
      return res.status(404).json({
        error: "Official not found",
        message: "Official profile not found",
      });
    }

    // Get pending submissions for review
    const pendingSubmissions = await Submission.find({
      status: "pending",
    }).populate("athleteId", "name email");

    res.json({
      message: "Dashboard data retrieved successfully",
      official: official,
      stats: {
        pendingReviews: pendingSubmissions.length,
      },
      pendingSubmissions: pendingSubmissions,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get dashboard",
      message: error.message,
    });
  }
};

// Get all submissions for review
const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("athleteId", "name email sport")
      .sort({ createdAt: -1 });

    res.json({
      message: "Submissions retrieved successfully",
      submissions: submissions,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get submissions",
      message: error.message,
    });
  }
};

// Review a submission
const reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback, score } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        status,
        feedback,
        score,
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate("athleteId", "name email");

    if (!submission) {
      return res.status(404).json({
        error: "Submission not found",
        message: "Submission not found",
      });
    }

    res.json({
      message: "Submission reviewed successfully",
      submission: submission,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to review submission",
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getSubmissions,
  reviewSubmission,
};
