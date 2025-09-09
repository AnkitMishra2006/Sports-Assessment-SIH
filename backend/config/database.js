const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

/**
 * MongoDB Connection Configuration
 * Handles connection, error handling, and connection events
 */
class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionString =
      process.env.MONGODB_URI || "mongodb://localhost:27017/sports-assessment";

    // MongoDB connection options
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    this.setupEventListeners();
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      if (this.isConnected) {
        console.log("📊 Already connected to MongoDB");
        return;
      }

      console.log("🔌 Connecting to MongoDB...");
      console.log(
        `📍 Connection String: ${this.connectionString.replace(
          /\/\/.*@/,
          "//***:***@"
        )}`
      );

      await mongoose.connect(this.connectionString, this.options);
      this.isConnected = true;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error.message);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      if (!this.isConnected) {
        console.log("📊 Already disconnected from MongoDB");
        return;
      }

      await mongoose.disconnect();
      this.isConnected = false;
      console.log("📊 Disconnected from MongoDB");
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error.message);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }

  /**
   * Setup MongoDB connection event listeners
   */
  setupEventListeners() {
    // Connection successful
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      console.log("✅ MongoDB connected successfully");
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(
        `🏠 Host: ${mongoose.connection.host}:${mongoose.connection.port}`
      );
    });

    // Connection error
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error.message);
      this.isConnected = false;
    });

    // Connection disconnected
    mongoose.connection.on("disconnected", () => {
      console.log("📊 MongoDB disconnected");
      this.isConnected = false;
    });

    // Connection reconnected
    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
      this.isConnected = true;
    });

    // If the Node process ends, close the MongoDB connection
    process.on("SIGINT", async () => {
      await this.disconnect();
      console.log("👋 MongoDB connection closed through app termination");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.disconnect();
      console.log("👋 MongoDB connection closed through app termination");
      process.exit(0);
    });
  }

  /**
   * Health check for MongoDB connection
   */
  async healthCheck() {
    try {
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.ping();
      return {
        status: "healthy",
        message: "MongoDB connection is active",
        timestamp: new Date(),
        ping: result,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: error.message,
        timestamp: new Date(),
      };
    }
  }
}

// Create and export database instance
const database = new DatabaseConnection();

module.exports = database;
