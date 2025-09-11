const express = require("express");
const router = express.Router();
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Submission = require("../models/Submission");
const { authenticate } = require("../middleware/auth");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/videos");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Video upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files allowed"));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Helper function to get result unit
function getResultUnit(exerciseType) {
  const units = {
    "bicep-curls": "reps",
    "sit-ups": "reps",
    "vertical-jump": "cm",
  };
  return units[exerciseType] || "count";
}

// Helper function to convert exercise type for Python
function convertExerciseType(exerciseType) {
  const mapping = {
    "bicep-curls": "BICEP_CURLS",
    "sit-ups": "SITUPS",
    "vertical-jump": "VERTICAL_JUMP",
  };
  return mapping[exerciseType] || exerciseType.toUpperCase();
}

// Video analysis endpoint - DEMO VERSION (No Auth Required)
router.post("/analyze-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const { exerciseType } = req.body;
    const videoPath = req.file.path;

    console.log(
      `DEMO: Processing video analysis for ${exerciseType} with file: ${req.file.filename}`
    );

    // Simulate processing time
    setTimeout(() => {
      // Return fake results for demo
      const fakeResults = {
        success: true,
        submissionId: `demo-${Date.now()}`,
        submission: {
          _id: `demo-${Date.now()}`,
          exerciseType: exerciseType,
          result: exerciseType === "sit-ups" ? 25 : 15,
          resultUnit: exerciseType === "sit-ups" ? "reps" : "count",
          percentile: 85,
          analysisResults: {
            total_reps: exerciseType === "sit-ups" ? 25 : 15,
            left_reps: exerciseType === "sit-ups" ? 12 : 7,
            right_reps: exerciseType === "sit-ups" ? 13 : 8,
            form_score: 88,
            consistency_score: 82,
            max_height_cm: exerciseType === "vertical-jump" ? 45 : undefined,
            jump_count: exerciseType === "vertical-jump" ? 3 : undefined,
            cheat_detected: false,
            form_issues: ["Maintain straighter back", "Control the descent"],
            frames_processed: 180,
            detection_quality: 0.95,
          },
          videoFilename: req.file.filename,
          createdAt: new Date().toISOString(),
        },
      };

      res.json(fakeResults);
    }, 3000); // 3 second delay to simulate processing
  } catch (error) {
    console.error("Analysis endpoint error:", error);
    res.status(500).json({
      error: "Analysis failed",
      message: error.message,
    });
  }
});

// Live analysis endpoint - DEMO VERSION
router.post("/analyze-live", async (req, res) => {
  try {
    const { exerciseType } = req.body;
    const sessionId = Date.now().toString();

    console.log(
      `DEMO: Starting live analysis session for ${exerciseType}, session ID: ${sessionId}`
    );

    res.json({
      success: true,
      sessionId: sessionId,
      message: "Live analysis session started",
      exerciseType: exerciseType,
      userId: `demo-user-${sessionId}`,
    });
  } catch (error) {
    console.error("Live analysis error:", error);
    res.status(500).json({
      error: "Live analysis failed",
      message: error.message,
    });
  }
});

// Process live camera frame
router.post("/process-frame", async (req, res) => {
  try {
    const { sessionId, frameData, exerciseType } = req.body;

    console.log(
      `DEMO: Processing frame for session ${sessionId}, exercise: ${exerciseType}`
    );

    // Simulate real-time analysis with varying results
    const repCount = Math.floor(Math.random() * 15) + 1;
    const formScore = Math.floor(Math.random() * 30) + 70; // 70-100%
    const currentStage = Math.random() > 0.5 ? "up" : "down";
    const formStatus =
      formScore > 85 ? "good" : formScore > 70 ? "neutral" : "bad";

    const results = {
      sessionId,
      exerciseType,
      repCount,
      formScore,
      currentStage,
      formStatus,
      confidence: 0.85 + Math.random() * 0.15,
      timestamp: Date.now(),
      poseDetected: true,
      landmarks: generateFakeLandmarks(), // Generate fake pose landmarks for demo
    };

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Frame processing error:", error);
    res.status(500).json({
      error: "Frame processing failed",
      message: error.message,
    });
  }
});

// Helper function to generate fake pose landmarks for demo
function generateFakeLandmarks() {
  // Generate fake pose landmarks for demo purposes
  const landmarks = [];
  for (let i = 0; i < 33; i++) {
    // 33 pose landmarks in MediaPipe
    landmarks.push({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.5,
      visibility: 0.8 + Math.random() * 0.2,
    });
  }
  return landmarks;
}

// Get video file
router.get("/video/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const videoPath = path.join(uploadsDir, filename);

    if (fs.existsSync(videoPath)) {
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        // Support video streaming with range requests
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  } catch (error) {
    console.error("Video serving error:", error);
    res.status(500).json({ error: "Failed to serve video" });
  }
});

// Get analysis results - DEMO VERSION
router.get("/results/:submissionId", async (req, res) => {
  try {
    // Return fake demo results
    const fakeSubmission = {
      _id: req.params.submissionId,
      exerciseType: "sit-ups",
      result: 25,
      resultUnit: "reps",
      percentile: 85,
      analysisResults: {
        total_reps: 25,
        left_reps: 12,
        right_reps: 13,
        form_score: 88,
        consistency_score: 82,
        cheat_detected: false,
        form_issues: ["Maintain straighter back", "Control the descent"],
        frames_processed: 180,
        detection_quality: 0.95,
      },
      status: "completed",
      submittedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      submission: fakeSubmission,
    });
  } catch (error) {
    console.error("Get results error:", error);
    res.status(500).json({
      error: "Failed to get results",
      message: error.message,
    });
  }
});

// Get user's analysis history
router.get("/history", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ athleteId: req.user.userId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments({
      athleteId: req.user.userId,
    });

    res.json({
      success: true,
      submissions: submissions,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      error: "Failed to get history",
      message: error.message,
    });
  }
});

module.exports = router;
