const Athlete = require("../models/Athlete");

// Get athlete dashboard data
const getDashboard = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.user.userId)
      .select("-password")
      .populate("submissions");

    if (!athlete) {
      return res.status(404).json({
        error: "Athlete not found",
        message: "Athlete profile not found",
      });
    }

    res.json({
      message: "Dashboard data retrieved successfully",
      athlete: athlete,
      stats: {
        totalSubmissions: athlete.submissions?.length || 0,
        // Add more stats as needed
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get dashboard",
      message: error.message,
    });
  }
};

// Update athlete profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Remove password from updates for security
    delete updates.password;
    delete updates.email; // Don't allow email updates through this route

    const athlete = await Athlete.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!athlete) {
      return res.status(404).json({
        error: "Athlete not found",
        message: "Athlete profile not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      athlete: athlete,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update profile",
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  updateProfile,
};
