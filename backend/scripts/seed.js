const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { Athlete, Official, Submission } = require("../models");

// Load environment variables
dotenv.config();

/**
 * Database Seeding Script
 * Seeds the database with sample data for development and testing
 */

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sports-assessment";

// Sample data
const sampleAthletes = [
  {
    name: "Raj Kumar",
    email: "raj.kumar@email.com",
    phone: "9876543210",
    password: "athlete123",
    age: 18,
    gender: "male",
    dateOfBirth: new Date("2005-03-15"),
    state: "Maharashtra",
    district: "Mumbai",
    height: 175,
    weight: 65,
    emergencyContact: "Rajesh Kumar - 9876543211 (Father)",
    testProgress: {
      verticalJump: { status: "pending" },
      sitUps: { status: "pending" },
      shuttleRun: { status: "pending" },
      enduranceRun: { status: "pending" },
      pushUps: { status: "pending" },
      flexibility: { status: "pending" },
      balance: { status: "pending" },
      broadJump: { status: "pending" },
    },
    badges: [],
    profileCompletion: 85,
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "9876543211",
    password: "athlete123",
    age: 20,
    gender: "female",
    dateOfBirth: new Date("2003-07-22"),
    state: "Karnataka",
    district: "Bangalore",
    height: 160,
    weight: 55,
    emergencyContact: "Sunita Sharma - 9876543212 (Mother)",
    testProgress: {
      verticalJump: { status: "pending" },
      sitUps: { status: "pending" },
      shuttleRun: { status: "verified" },
      enduranceRun: { status: "pending" },
      pushUps: { status: "pending" },
      flexibility: { status: "pending" },
      balance: { status: "pending" },
      broadJump: { status: "pending" },
    },
    badges: ["Top Performer"],
    profileCompletion: 90,
    overallScore: 92,
    rank: 1,
  },
  {
    name: "Arjun Singh",
    email: "arjun.singh@email.com",
    phone: "9876543212",
    password: "athlete123",
    age: 16,
    gender: "male",
    dateOfBirth: new Date("2007-11-10"),
    state: "Punjab",
    district: "Amritsar",
    height: 170,
    weight: 70,
    emergencyContact: "Manjeet Singh - 9876543213 (Father)",
    testProgress: {
      verticalJump: { status: "pending" },
      sitUps: { status: "pending" },
      shuttleRun: { status: "pending" },
      enduranceRun: { status: "pending" },
      pushUps: { status: "pending" },
      flexibility: { status: "pending" },
      balance: { status: "pending" },
      broadJump: { status: "pending" },
    },
    badges: [],
    profileCompletion: 75,
  },
];

const sampleOfficials = [
  {
    name: "Dr. Rajesh Gupta",
    email: "rajesh.gupta@sai.gov.in",
    phone: "9876543220",
    password: "official123",
    employeeId: "SAI001",
    designation: "Senior Sports Officer",
    department: "Sports Authority of India",
    state: "Maharashtra",
    district: "Mumbai",
    role: "senior_official",
    totalReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
  },
  {
    name: "Ms. Sunita Verma",
    email: "sunita.verma@sai.gov.in",
    phone: "9876543221",
    password: "official123",
    employeeId: "SAI002",
    designation: "Sports Analyst",
    department: "Sports Authority of India",
    state: "Karnataka",
    district: "Bangalore",
    role: "analyst",
    totalReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
  },
];

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

/**
 * Clean existing data
 */
async function cleanDatabase() {
  try {
    await Athlete.deleteMany({});
    await Official.deleteMany({});
    await Submission.deleteMany({});
    console.log("🧹 Cleaned existing data");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    throw error;
  }
}

/**
 * Seed Athletes
 */
async function seedAthletes() {
  try {
    // Hash passwords for all athletes
    const hashedPassword = await bcrypt.hash("athlete123", 10);
    const athletesWithHashedPasswords = sampleAthletes.map((athlete) => ({
      ...athlete,
      password: hashedPassword,
    }));

    const athletes = await Athlete.insertMany(athletesWithHashedPasswords);
    console.log(`👥 Created ${athletes.length} sample athletes`);
    return athletes;
  } catch (error) {
    console.error("❌ Error seeding athletes:", error);
    throw error;
  }
}

/**
 * Seed Officials
 */
async function seedOfficials() {
  try {
    // Hash passwords for all officials
    const hashedPassword = await bcrypt.hash("official123", 10);
    const officialsWithHashedPasswords = sampleOfficials.map((official) => ({
      ...official,
      password: hashedPassword,
    }));

    const officials = await Official.insertMany(officialsWithHashedPasswords);
    console.log(`👨‍💼 Created ${officials.length} sample officials`);
    return officials;
  } catch (error) {
    console.error("❌ Error seeding officials:", error);
    throw error;
  }
}

async function seedSubmissions(athletes, officials) {
  try {
    const sampleSubmissions = [
      {
        athlete: athletes[0]._id,
        athleteId: "ATH001",
        athleteName: athletes[0].name,
        age: athletes[0].age,
        gender: athletes[0].gender,
        district: athletes[0].district,
        state: athletes[0].state,
        testType: "vertical-jump",
        result: 48,
        resultUnit: "cm",
        percentile: 85,
        attempts: 3,
        bestScore: 48,
        performanceData: {
          measurements: [
            { attempt: 1, value: 45, unit: "cm", timestamp: new Date() },
            { attempt: 2, value: 48, unit: "cm", timestamp: new Date() },
            { attempt: 3, value: 47, unit: "cm", timestamp: new Date() },
          ],
          feedback: [
            "Great explosive power in takeoff phase",
            "Good arm coordination during jump",
          ],
        },
        videoUrl: "/mock-videos/vertical-jump-raj-kumar.mp4",
        videoData: {
          filename: "vertical_jump_raj_kumar.mp4",
          originalName: "VJ_Test_001.mp4",
          size: 5242880, // 5MB
          duration: 30,
          format: "mp4",
        },
        aiAnalysis: {
          processed: true,
          formScore: 92,
          consistencyScore: 88,
          confidence: 0.95,
          flaggedIssues: [],
        },
        status: "pending",
        submittedAt: new Date("2024-01-15T10:30:00Z"),
        deviceInfo: {
          type: "mobile",
          os: "Android",
          browser: "Chrome",
        },
      },
      {
        athlete: athletes[1]._id,
        athleteId: "ATH002",
        athleteName: athletes[1].name,
        age: athletes[1].age,
        gender: athletes[1].gender,
        district: athletes[1].district,
        state: athletes[1].state,
        testType: "shuttle-run",
        result: 12.2,
        resultUnit: "sec",
        percentile: 92,
        attempts: 2,
        bestScore: 12.2,
        performanceData: {
          measurements: [
            { attempt: 1, value: 12.5, unit: "sec", timestamp: new Date() },
            { attempt: 2, value: 12.2, unit: "sec", timestamp: new Date() },
          ],
          feedback: [
            "Excellent agility and speed",
            "Perfect form throughout the test",
          ],
        },
        videoUrl: "/mock-videos/shuttle-run-priya-sharma.mp4",
        videoData: {
          filename: "shuttle_run_priya_sharma.mp4",
          originalName: "SR_Test_001.mp4",
          size: 8388608, // 8MB
          duration: 45,
          format: "mp4",
        },
        aiAnalysis: {
          processed: true,
          formScore: 96,
          consistencyScore: 94,
          confidence: 0.98,
          flaggedIssues: [],
        },
        status: "approved",
        submittedAt: new Date("2024-01-15T09:15:00Z"),
        review: {
          reviewer: officials[0]._id,
          reviewedAt: new Date(),
          decision: "approved",
          verifiedScore: 12.2,
          comments: "Excellent form and timing. Outstanding performance.",
          reasons: ["good_performance"],
          reviewTime: 5,
        },
        deviceInfo: {
          type: "mobile",
          os: "iOS",
          browser: "Safari",
        },
      },
    ];

    const submissions = await Submission.insertMany(sampleSubmissions);
    console.log(`📊 Created ${submissions.length} sample submissions`);

    // Update athlete test progress
    await Athlete.findByIdAndUpdate(athletes[0]._id, {
      "testProgress.verticalJump.status": "completed",
      "testProgress.verticalJump.completedAt": new Date(),
    });

    await Athlete.findByIdAndUpdate(athletes[1]._id, {
      "testProgress.shuttleRun.status": "verified",
      "testProgress.shuttleRun.completedAt": new Date(),
      overallScore: 92,
      rank: 1,
    });

    // Update official statistics
    await Official.findByIdAndUpdate(officials[0]._id, {
      $inc: {
        totalReviews: 1,
        approvedReviews: 1,
      },
    });

    return submissions;
  } catch (error) {
    console.error("❌ Error seeding submissions:", error);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");
    console.log();

    await connectDB();
    await cleanDatabase();

    const athletes = await seedAthletes();
    const officials = await seedOfficials();
    const submissions = await seedSubmissions(athletes, officials);

    console.log();
    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   Athletes: ${athletes.length}`);
    console.log(`   Officials: ${officials.length}`);
    console.log(`   Submissions: ${submissions.length}`);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  } finally {
    console.log();
    console.log("👋 Disconnected from MongoDB");
    await mongoose.disconnect();
    process.exit(0);
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    console.log("🧪 Testing database connection...");
    console.log();

    await connectDB();

    const athleteCount = await Athlete.countDocuments();
    const officialCount = await Official.countDocuments();
    const submissionCount = await Submission.countDocuments();

    console.log("📊 Current database state:");
    console.log(`   Athletes: ${athleteCount}`);
    console.log(`   Officials: ${officialCount}`);
    console.log(`   Submissions: ${submissionCount}`);

    console.log();
    console.log("✅ Database connection test successful!");
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
  } finally {
    console.log();
    console.log("👋 Disconnected from MongoDB");
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case "seed":
    seedDatabase();
    break;
  case "test":
    testConnection();
    break;
  default:
    console.log("📖 Usage:");
    console.log("  npm run seed    - Seed database with sample data");
    console.log("  npm run test-db - Test database connection");
    process.exit(1);
}
