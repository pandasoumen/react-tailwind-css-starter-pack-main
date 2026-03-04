const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ------------------------------
// PATIENT SIGNUP
// ------------------------------
exports.signupPatient = async (req, res) => {
  try {
    const { name, email, password, profile } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    const user = await User.create({
      name,
      email,
      password,
      role: "patient",
      profile
    });

    await Patient.create({ user: user._id });

    res.json({
      success: true,
      token: generateToken(user),
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// DOCTOR SIGNUP
// ------------------------------
exports.signupDoctor = async (req, res) => {
  try {
    const { name, email, password, doctorProfile } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    const user = await User.create({
      name,
      email,
      password,
      role: "doctor",
    });

    await Doctor.create({
      user: user._id,
      ...doctorProfile
    });

    res.json({
      success: true,
      token: generateToken(user),
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// LOGIN
// ------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      success: true,
      token: generateToken(user),
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
