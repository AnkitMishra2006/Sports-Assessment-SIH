const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const Athlete = require("../models/Athlete");
const Official = require("../models/Official");

// Athlete Registration
const registerAthlete = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, address, sport } =
      req.body;

    // Check if athlete already exists
    const existingAthlete = await Athlete.findOne({ email });
    if (existingAthlete) {
      return res.status(400).json({
        error: "Registration failed",
        message: "Athlete with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create athlete
    const athlete = new Athlete({
      name,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth,
      address,
      sport,
    });

    await athlete.save();

    // Generate token
    const token = generateToken({
      userId: athlete._id,
      email: athlete.email,
      userType: "athlete",
    });

    res.status(201).json({
      message: "Athlete registered successfully",
      token,
      user: {
        id: athlete._id,
        name: athlete.name,
        email: athlete.email,
        userType: "athlete",
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Registration failed",
      message: error.message,
    });
  }
};

// Athlete Login
const loginAthlete = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find athlete
    const athlete = await Athlete.findOne({ email });
    if (!athlete) {
      return res.status(400).json({
        error: "Login failed",
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, athlete.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Login failed",
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({
      userId: athlete._id,
      email: athlete.email,
      userType: "athlete",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: athlete._id,
        name: athlete.name,
        email: athlete.email,
        userType: "athlete",
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Login failed",
      message: error.message,
    });
  }
};

// Official Registration
const registerOfficial = async (req, res) => {
  try {
    const { name, email, password, phone, officialId, role, department } =
      req.body;

    // Check if official already exists
    const existingOfficial = await Official.findOne({ email });
    if (existingOfficial) {
      return res.status(400).json({
        error: "Registration failed",
        message: "Official with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create official
    const official = new Official({
      name,
      email,
      password: hashedPassword,
      phone,
      officialId,
      role,
      department,
    });

    await official.save();

    // Generate token
    const token = generateToken({
      userId: official._id,
      email: official.email,
      userType: "official",
    });

    res.status(201).json({
      message: "Official registered successfully",
      token,
      user: {
        id: official._id,
        name: official.name,
        email: official.email,
        userType: "official",
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Registration failed",
      message: error.message,
    });
  }
};

// Official Login
const loginOfficial = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find official
    const official = await Official.findOne({ email });
    if (!official) {
      return res.status(400).json({
        error: "Login failed",
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, official.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Login failed",
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({
      userId: official._id,
      email: official.email,
      userType: "official",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: official._id,
        name: official.name,
        email: official.email,
        userType: "official",
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Login failed",
      message: error.message,
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    let user;

    if (req.user.userType === "athlete") {
      user = await Athlete.findById(req.user.userId).select("-password");
    } else if (req.user.userType === "official") {
      user = await Official.findById(req.user.userId).select("-password");
    }

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User profile not found",
      });
    }

    res.json({
      user: {
        ...user.toObject(),
        userType: req.user.userType,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get profile",
      message: error.message,
    });
  }
};

module.exports = {
  registerAthlete,
  loginAthlete,
  registerOfficial,
  loginOfficial,
  getProfile,
};
