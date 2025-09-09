const mongoose = require("mongoose");

/**
 * Submission Schema
 * Stores athlete test submissions with videos and performance data
 * Updated to match frontend requirements
 */
const submissionSchema = new mongoose.Schema(
  {
    // Basic submission info
    id: {
      type: String,
      unique: true,
      default: function () {
        return "SUB" + Date.now().toString().substr(-6);
      },
    },

    // Reference to Athlete
    athlete: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Athlete",
      required: [true, "Athlete reference is required"],
    },

    // Athlete information (denormalized for quick access)
    athleteId: {
      type: String,
      required: true,
    },
    athleteName: {
      type: String,
      required: [true, "Athlete name is required"],
    },
    age: {
      type: Number,
      required: [true, "Athlete age is required"],
      min: 8,
      max: 50,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },
    district: {
      type: String,
      required: [true, "District is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },

    // Test Information
    testType: {
      type: String,
      required: [true, "Test type is required"],
      enum: [
        "vertical-jump",
        "sit-ups",
        "shuttle-run",
        "endurance-run",
        "push-ups",
        "flexibility",
        "balance",
        "broad-jump",
        "height-weight",
      ],
    },

    // Test Results
    result: {
      type: Number,
      required: [true, "Test result is required"],
      min: 0,
    },
    resultUnit: {
      type: String,
      required: true,
      enum: ["cm", "m", "sec", "min", "kg", "count", "reps"],
    },

    // Performance Analysis
    percentile: {
      type: Number,
      min: 0,
      max: 100,
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    bestScore: {
      type: Number,
      required: true,
    },

    // Detailed performance data
    performanceData: {
      measurements: [
        {
          attempt: {
            type: Number,
            required: true,
            min: 1,
          },
          value: {
            type: Number,
            required: true,
          },
          unit: {
            type: String,
            enum: ["cm", "m", "sec", "min", "kg", "count", "reps"],
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      // Mock AI feedback
      feedback: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // Video Evidence
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    videoData: {
      filename: String,
      originalName: String,
      size: Number, // in bytes
      duration: Number, // in seconds
      format: {
        type: String,
        enum: ["mp4", "avi", "mov", "webm"],
      },
      thumbnailUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // AI Analysis (Mock implementation)
    aiAnalysis: {
      processed: {
        type: Boolean,
        default: false,
      },
      formScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      consistencyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      confidence: {
        type: Number, // 0-1 scale
        min: 0,
        max: 1,
        default: 0,
      },
      flaggedIssues: [
        {
          type: String,
          trim: true,
        },
      ],
      detectedAnomalies: [
        {
          type: {
            type: String,
            enum: [
              "invalid_form",
              "incomplete_reps",
              "timing_mismatch",
              "equipment_issue",
              "environmental_factor",
            ],
          },
          description: String,
          severity: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
          },
          timestamp: Number, // Second in video
        },
      ],
      processedAt: Date,
      aiModelVersion: String,
    },

    // Submission Status
    status: {
      type: String,
      enum: [
        "pending", // Awaiting review
        "approved", // Verified and approved
        "rejected", // Rejected with reasons
        "flagged", // Flagged for manual review
      ],
      default: "pending",
    },

    // Flags and Issues
    flags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Timestamps
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Official Review
    review: {
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Official",
      },
      reviewedAt: Date,
      decision: {
        type: String,
        enum: ["approved", "rejected", "flagged"],
      },
      verifiedScore: {
        type: Number, // Verified score if different from submitted
        min: 0,
      },
      comments: {
        type: String,
        maxLength: [1000, "Comments cannot exceed 1000 characters"],
      },
      reasons: [
        {
          type: String,
          enum: [
            "good_performance",
            "invalid_form",
            "incomplete_test",
            "video_quality_poor",
            "measurement_error",
            "equipment_issue",
            "rule_violation",
            "suspicious_activity",
            "technical_issue",
          ],
        },
      ],
      reviewTime: {
        type: Number, // in minutes
        min: 0,
      },
    },

    // Additional metadata
    deviceInfo: {
      type: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "camera"],
      },
      os: String,
      browser: String,
      appVersion: String,
    },

    // Location data
    location: {
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      address: {
        city: String,
        state: String,
        country: String,
      },
    },

    // Status history for audit trail
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected", "flagged"],
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Official",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
submissionSchema.index({ athlete: 1, testType: 1 });
submissionSchema.index({ status: 1, submittedAt: -1 });
submissionSchema.index({ testType: 1, status: 1 });
submissionSchema.index({ district: 1, state: 1 });
submissionSchema.index({ percentile: -1 }); // For leaderboards
submissionSchema.index({ "review.reviewer": 1, "review.reviewedAt": -1 });
submissionSchema.index({ submittedAt: -1 }); // For recent submissions
submissionSchema.index({ id: 1 }, { unique: true });

// Pre-save middleware to update status history
submissionSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

// Method to calculate percentile based on test performance
submissionSchema.methods.calculatePercentile = async function () {
  try {
    // Count submissions with better scores in same test type and gender
    const betterScores = await this.model("Submission").countDocuments({
      testType: this.testType,
      gender: this.gender,
      status: "approved",
      result: {
        $gt:
          this.testType === "shuttle-run"
            ? { $lt: this.result } // Lower time is better for shuttle run
            : { $gt: this.result }, // Higher score is better for other tests
      },
    });

    // Count total submissions in same category
    const totalScores = await this.model("Submission").countDocuments({
      testType: this.testType,
      gender: this.gender,
      status: "approved",
    });

    if (totalScores === 0) return 50; // Default percentile

    const percentile = Math.round(
      ((totalScores - betterScores) / totalScores) * 100
    );
    this.percentile = percentile;

    return percentile;
  } catch (error) {
    console.error("Error calculating percentile:", error);
    return 0;
  }
};

// Method to add flag to submission
submissionSchema.methods.addFlag = function (flagDescription) {
  if (!this.flags.includes(flagDescription)) {
    this.flags.push(flagDescription);
  }

  if (this.status === "approved" || this.status === "pending") {
    this.status = "flagged";
  }

  return this.save();
};

// Method to get submission summary for dashboard
submissionSchema.methods.getSummary = function () {
  return {
    id: this.id,
    athleteName: this.athleteName,
    age: this.age,
    gender: this.gender,
    district: this.district,
    testType: this.testType,
    result: this.result,
    percentile: this.percentile,
    submittedAt: this.submittedAt,
    status: this.status,
    flags: this.flags,
    hasVideo: !!this.videoUrl,
  };
};

// Method to update review status
submissionSchema.methods.updateReview = function (reviewData) {
  this.review = {
    ...this.review,
    ...reviewData,
    reviewedAt: new Date(),
  };

  if (reviewData.decision) {
    this.status = reviewData.decision;
  }

  return this.save();
};

// Virtual for test name display
submissionSchema.virtual("testName").get(function () {
  const testNames = {
    "vertical-jump": "Vertical Jump",
    "sit-ups": "Sit-ups",
    "shuttle-run": "Shuttle Run",
    "endurance-run": "Endurance Run",
    "push-ups": "Push-ups",
    flexibility: "Flexibility Test",
    balance: "Balance Test",
    "broad-jump": "Broad Jump",
    "height-weight": "Height & Weight",
  };

  return testNames[this.testType] || this.testType;
});

// Virtual for result display with unit
submissionSchema.virtual("resultDisplay").get(function () {
  return `${this.result}${this.resultUnit}`;
});

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
