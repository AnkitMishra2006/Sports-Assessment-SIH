const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Athlete Schema
 * Stores athlete registration and profile information
 * Updated to match frontend requirements
 */
const athleteSchema = new mongoose.Schema(
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

    // Personal Details
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    age: {
      type: Number,
      min: [8, "Age must be at least 8 years"],
      max: [50, "Age cannot exceed 50 years"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },

    // Location Information
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },

    // Physical Measurements
    height: {
      type: Number, // in cm
      min: [100, "Height must be at least 100 cm"],
      max: [250, "Height cannot exceed 250 cm"],
    },
    weight: {
      type: Number, // in kg
      min: [20, "Weight must be at least 20 kg"],
      max: [200, "Weight cannot exceed 200 kg"],
    },

    // Sports Information
    sport: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "professional"],
      default: "beginner",
    },
    previousAchievements: {
      type: String,
      trim: true,
    },

    // Additional Information (from frontend form)
    parentName: {
      type: String,
      trim: true,
    },
    parentPhone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    schoolCollege: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    medicalConditions: {
      type: String,
      trim: true,
    },
    consent: {
      type: Boolean,
      default: false,
    },

    // Test Progress (matching frontend structure)
    testProgress: {
      heightWeight: {
        status: {
          type: String,
          enum: ["pending", "completed", "verified", "rejected"],
          default: "pending",
        },
        completedAt: Date,
        result: mongoose.Schema.Types.Mixed,
      },
      verticalJump: {
        status: {
          type: String,
          enum: ["pending", "completed", "verified", "rejected"],
          default: "pending",
        },
        completedAt: Date,
        result: mongoose.Schema.Types.Mixed,
      },
      sitUps: {
        status: {
          type: String,
          enum: ["pending", "completed", "verified", "rejected"],
          default: "pending",
        },
        completedAt: Date,
        result: mongoose.Schema.Types.Mixed,
      },
      shuttleRun: {
        status: {
          type: String,
          enum: ["pending", "completed", "verified", "rejected"],
          default: "pending",
        },
        completedAt: Date,
        result: mongoose.Schema.Types.Mixed,
      },
      enduranceRun: {
        status: {
          type: String,
          enum: ["pending", "completed", "verified", "rejected"],
          default: "pending",
        },
        completedAt: Date,
        result: mongoose.Schema.Types.Mixed,
      },
      pushUps: {
        status: {
          type: String,
          enum: ["pending", "completed", "verified", "rejected"],
          default: "pending",
        },
        completedAt: Date,
        result: mongoose.Schema.Types.Mixed,
      },
      flexibility: {
        status: {
          type: String,
          enum: ["pending", "completed", "verified", "rejected"],
          default: "pending",
        },
        completedAt: Date,
        result: mongoose.Schema.Types.Mixed,
      },
      balance: {
        status: {
          type: String,
          enum: ["pending", "completed", "verified", "rejected"],
          default: "pending",
        },
        completedAt: Date,
        result: mongoose.Schema.Types.Mixed,
      },
      broadJump: {
        status: {
          type: String,
          enum: ["pending", "completed", "verified", "rejected"],
          default: "pending",
        },
        completedAt: Date,
        result: mongoose.Schema.Types.Mixed,
      },
    },

    // Performance Data
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rank: {
      type: Number,
      default: null,
    },

    // Test Scores (detailed performance data)
    testScores: {
      "vertical-jump": {
        score: Number,
        percentile: Number,
        attempts: Number,
        best: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
      "sit-ups": {
        score: Number,
        percentile: Number,
        attempts: Number,
        best: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
      "shuttle-run": {
        score: Number,
        percentile: Number,
        attempts: Number,
        best: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
      "endurance-run": {
        score: Number,
        percentile: Number,
        attempts: Number,
        best: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
      "push-ups": {
        score: Number,
        percentile: Number,
        attempts: Number,
        best: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
      flexibility: {
        score: Number,
        percentile: Number,
        attempts: Number,
        best: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
      balance: {
        score: Number,
        percentile: Number,
        attempts: Number,
        best: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
      "broad-jump": {
        score: Number,
        percentile: Number,
        attempts: Number,
        best: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
    },

    // Gamification
    badges: [
      {
        type: String,
        enum: [
          "Top Performer",
          "Speed Demon",
          "Endurance Warrior",
          "Balance Master",
          "Power House",
          "Consistent Performer",
          "Strength Champion",
          "Jump Master",
          "Flexibility King",
          "Core Crusher",
          "Agility Ace",
          "Distance Runner",
        ],
      },
    ],
    totalPoints: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Profile Image
    profileImage: {
      type: String, // URL to uploaded image
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
athleteSchema.index({ email: 1 });
athleteSchema.index({ state: 1, district: 1 });
athleteSchema.index({ age: 1, gender: 1 });
athleteSchema.index({ isActive: 1, isVerified: 1 });

// Virtual to calculate age from dateOfBirth
athleteSchema.virtual("calculatedAge").get(function () {
  if (!this.dateOfBirth) return this.age;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Hash password before saving
athleteSchema.pre("save", async function (next) {
  // Only hash password if it's modified
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    // Update age from dateOfBirth if dateOfBirth is modified
    if (this.isModified("dateOfBirth") && this.dateOfBirth) {
      this.age = this.calculatedAge;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
athleteSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update test progress
athleteSchema.methods.updateTestProgress = function (
  testType,
  status,
  result = null
) {
  const testMap = {
    "vertical-jump": "verticalJump",
    "sit-ups": "sitUps",
    "shuttle-run": "shuttleRun",
    "endurance-run": "enduranceRun",
    "push-ups": "pushUps",
    flexibility: "flexibility",
    balance: "balance",
    "broad-jump": "broadJump",
    "height-weight": "heightWeight",
  };

  const mappedTest = testMap[testType] || testType;

  if (this.testProgress[mappedTest]) {
    this.testProgress[mappedTest].status = status;
    if (status === "completed") {
      this.testProgress[mappedTest].completedAt = new Date();
      this.testProgress[mappedTest].result = result;
    }
  }

  return this.save();
};

// Add badge to athlete
athleteSchema.methods.addBadge = function (badgeName) {
  if (!this.badges.includes(badgeName)) {
    this.badges.push(badgeName);
  }
  return this.save();
};

// Calculate overall score from test scores
athleteSchema.methods.calculateOverallScore = function () {
  const weights = {
    "vertical-jump": 0.15,
    "sit-ups": 0.15,
    "shuttle-run": 0.15,
    "endurance-run": 0.2,
    "push-ups": 0.1,
    flexibility: 0.1,
    balance: 0.05,
    "broad-jump": 0.1,
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(this.testScores || {}).forEach(([testId, data]) => {
    if (data?.percentile && weights[testId]) {
      totalScore += data.percentile * weights[testId];
      totalWeight += weights[testId];
    }
  });

  this.overallScore =
    totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  return this.save();
};

// Get athlete's dashboard data
athleteSchema.methods.getDashboardData = function () {
  return {
    name: this.name,
    email: this.email,
    district: this.district,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    age: this.calculatedAge,
    overallScore: this.overallScore,
    rank: this.rank,
    testProgress: this.testProgress,
    badges: this.badges,
    testScores: this.testScores,
  };
};

// Get profile completeness percentage
athleteSchema.virtual("profileCompleteness").get(function () {
  let completed = 0;
  let total = 12;

  if (this.name) completed++;
  if (this.email) completed++;
  if (this.phone) completed++;
  if (this.dateOfBirth) completed++;
  if (this.gender) completed++;
  if (this.state && this.district) completed++;
  if (this.height) completed++;
  if (this.weight) completed++;
  if (this.sport) completed++;
  if (this.parentName) completed++;
  if (this.schoolCollege) completed++;
  if (this.consent) completed++;

  return Math.round((completed / total) * 100);
});

// Remove password from JSON output
athleteSchema.methods.toJSON = function () {
  const athlete = this.toObject({ virtuals: true });
  delete athlete.password;
  return athlete;
};

const Athlete = mongoose.model("Athlete", athleteSchema);

module.exports = Athlete;
