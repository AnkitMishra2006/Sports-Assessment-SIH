const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Import database connection
const database = require("./config/database");

// Import models (this will help ensure they're registered with Mongoose)
require("./models");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Basic middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Simple logging in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Import routes
const authRoutes = require("./routes/authRoutes");
const athleteRoutes = require("./routes/athleteRoutes");
const officialRoutes = require("./routes/officialRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/athletes", athleteRoutes);
app.use("/api/officials", officialRoutes);

// Routes
// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    const serverHealth = {
      status: "healthy",
      timestamp: new Date(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: "1.0.0",
      database: dbHealth,
    };

    const statusCode = dbHealth.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(serverHealth);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      message: "Health check failed",
      timestamp: new Date(),
    });
  }
});

// API version info
app.get("/api", (req, res) => {
  res.json({
    name: "Sports Assessment Platform API",
    version: "1.0.0",
    description: "Backend API for democratized athlete talent assessment",
    endpoints: {
      // Authentication
      "auth.register.athlete": "POST /api/auth/athlete/register",
      "auth.login.athlete": "POST /api/auth/athlete/login",
      "auth.register.official": "POST /api/auth/official/register",
      "auth.login.official": "POST /api/auth/official/login",
      "auth.profile": "GET /api/auth/profile (Protected)",

      // Athletes
      "athletes.dashboard": "GET /api/athletes/dashboard (Protected)",
      "athletes.profile": "PUT /api/athletes/profile (Protected)",

      // Officials
      "officials.dashboard": "GET /api/officials/dashboard (Protected)",
      "officials.submissions": "GET /api/officials/submissions (Protected)",
      "officials.review":
        "PUT /api/officials/submissions/:id/review (Protected)",
    },
  });
});

// Database status endpoint
app.get("/api/status/database", async (req, res) => {
  try {
    const status = database.getConnectionStatus();
    const health = await database.healthCheck();

    res.json({
      connection: status,
      health: health,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get database status",
      timestamp: new Date(),
    });
  }
});

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "Sports Assessment Platform",
    description:
      "Backend API for democratized athlete talent assessment platform",
    version: "1.0.0",
    author: "Smart India Hackathon Team",
    api: "/api",
    health: "/health",
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "/api",
      "/api/athletes",
      "/api/officials",
      "/api/submissions",
      "/api/auth",
      "/api/reports",
    ],
  });
});

// Handle 404 errors for all other routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestion: "Check the API documentation for available endpoints",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error occurred:", err);

  const errorResponse = {
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong!",
    timestamp: new Date(),
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === "ValidationError") {
    errorResponse.error = "Validation Error";
    errorResponse.details = err.errors;
    return res.status(400).json(errorResponse);
  }

  if (err.name === "CastError") {
    errorResponse.error = "Invalid ID format";
    errorResponse.message = "The provided ID is not valid";
    return res.status(400).json(errorResponse);
  }

  if (err.code === 11000) {
    errorResponse.error = "Duplicate Entry";
    errorResponse.message = "A record with this information already exists";
    return res.status(409).json(errorResponse);
  }

  res.status(err.statusCode || 500).json(errorResponse);
});

// Start server function
async function startServer() {
  try {
    // Connect to MongoDB first
    await database.connect();

    // Start the server
    const server = app.listen(port, () => {
      console.log("\n🚀 ==========================================");
      console.log("🏟️  Sports Assessment Platform Server");
      console.log("==========================================");
      console.log(`📡 Server running on port: ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API URL: http://localhost:${port}/api`);
      console.log(`❤️  Health Check: http://localhost:${port}/health`);
      console.log("==========================================\n");
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("📡 HTTP server closed.");
        await database.disconnect();
        console.log("👋 Graceful shutdown complete.");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.log("⚠️  Force shutdown...");
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      shutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      shutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
