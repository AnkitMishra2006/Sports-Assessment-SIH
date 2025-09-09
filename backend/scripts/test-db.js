const database = require("../config/database");
const { Athlete, Official, Submission } = require("../models");

/**
 * Database Connection Test
 * Tests MongoDB connection and basic operations
 */

async function testConnection() {
  try {
    console.log("🧪 Testing database connection...\n");

    // Test connection
    await database.connect();

    // Test connection status
    const status = database.getConnectionStatus();
    console.log("📊 Connection Status:", status);

    // Test health check
    const health = await database.healthCheck();
    console.log("❤️  Health Check:", health);

    // Test model operations
    console.log("\n🔧 Testing model operations...");

    // Count documents
    const athleteCount = await Athlete.countDocuments();
    const officialCount = await Official.countDocuments();
    const submissionCount = await Submission.countDocuments();

    console.log(`👥 Athletes in database: ${athleteCount}`);
    console.log(`👨‍💼 Officials in database: ${officialCount}`);
    console.log(`📊 Submissions in database: ${submissionCount}`);

    // Test basic CRUD
    console.log("\n📝 Testing basic CRUD operations...");

    // Create test athlete
    const testAthlete = new Athlete({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "test123",
      age: 18,
      gender: "male",
      dateOfBirth: new Date("2005-01-01"),
      state: "Test State",
      district: "Test District",
      pincode: "123456",
      phoneNumber: "1234567890",
    });

    await testAthlete.save();
    console.log("✅ Created test athlete:", testAthlete.name);

    // Read test athlete
    const foundAthlete = await Athlete.findById(testAthlete._id);
    console.log("✅ Read test athlete:", foundAthlete.name);

    // Update test athlete
    foundAthlete.height = 175;
    await foundAthlete.save();
    console.log("✅ Updated test athlete height:", foundAthlete.height);

    // Delete test athlete
    await Athlete.findByIdAndDelete(testAthlete._id);
    console.log("✅ Deleted test athlete");

    console.log("\n🎉 All tests passed! Database is working correctly.");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    console.error("Full error:", error);
  } finally {
    await database.disconnect();
    console.log("\n👋 Disconnected from database");
    process.exit(0);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testConnection();
}

module.exports = testConnection;
