const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Official Schema
 * Stores SAI officials and reviewers information
 * Updated to match frontend requirements
 */
const officialSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters long"],
    },

    // Official Details
    employeeId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },

    // Contact Information
    phoneNumber: {
      type: String,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },

    // Role and Permissions
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["admin", "senior_official", "reviewer", "analyst"],
      default: "reviewer",
    },

    // Assignment and Responsibility (simplified)
    assignedRegions: [
      {
        state: String,
        districts: [String],
      },
    ],

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },

    // Work Statistics (matching frontend expectations)
    totalReviews: {
      type: Number,
      default: 0,
    },
    approvedReviews: {
      type: Number,
      default: 0,
    },
    rejectedReviews: {
      type: Number,
      default: 0,
    },
    flaggedReviews: {
      type: Number,
      default: 0,
    },
    pendingReviews: {
      type: Number,
      default: 0,
    },

    // Profile Settings
    profileImage: {
      type: String, // URL to uploaded image
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
officialSchema.index({ email: 1 });
officialSchema.index({ employeeId: 1 });
officialSchema.index({ role: 1, isActive: 1 });
officialSchema.index({ "assignedRegions.state": 1 });
officialSchema.index({ specialization: 1 });

// Hash password before saving
officialSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
officialSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
officialSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Check if official can review submission from specific region
officialSchema.methods.canReviewRegion = function (state, district) {
  if (this.role === "admin") return true;

  return this.assignedRegions.some((region) => {
    return (
      region.state === state &&
      (region.districts.length === 0 || region.districts.includes(district))
    );
  });
};

// Get official's performance summary (simplified for frontend)
officialSchema.methods.getPerformanceSummary = function () {
  const totalReviews = this.totalReviews;
  const approvalRate =
    totalReviews > 0
      ? ((this.approvedReviews / totalReviews) * 100).toFixed(2)
      : 0;
  const rejectionRate =
    totalReviews > 0
      ? ((this.rejectedReviews / totalReviews) * 100).toFixed(2)
      : 0;

  return {
    totalReviews,
    approvedReviews: this.approvedReviews,
    rejectedReviews: this.rejectedReviews,
    flaggedReviews: this.flaggedReviews,
    pendingReviews: this.pendingReviews,
    approvalRate: parseFloat(approvalRate),
    rejectionRate: parseFloat(rejectionRate),
    assignedRegions: this.assignedRegions.length,
  };
};

// Get dashboard data for officials
officialSchema.methods.getDashboardData = function () {
  return {
    name: this.name,
    email: this.email,
    role: this.role,
    totalReviews: this.totalReviews,
    approvedReviews: this.approvedReviews,
    rejectedReviews: this.rejectedReviews,
    flaggedReviews: this.flaggedReviews,
    pendingReviews: this.pendingReviews,
    assignedRegions: this.assignedRegions,
    lastLogin: this.lastLogin,
  };
};

// Update review statistics
officialSchema.methods.updateReviewStats = function (decision) {
  this.totalReviews += 1;

  switch (decision) {
    case "approved":
      this.approvedReviews += 1;
      break;
    case "rejected":
      this.rejectedReviews += 1;
      break;
    case "flagged":
      this.flaggedReviews += 1;
      break;
  }

  return this.save();
};

// Remove password from JSON output
officialSchema.methods.toJSON = function () {
  const official = this.toObject();
  delete official.password;
  return official;
};

const Official = mongoose.model("Official", officialSchema);

module.exports = Official;
