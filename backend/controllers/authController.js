// const User = require("../models/User");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");


// // -------------------------
// // Generate JWT Token
// // -------------------------
// const generateToken = (user) => {
//   return jwt.sign(
//     {
//       id: user._id,
//       role: user.role,
//       email: user.email,
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// // -------------------------
// // Patient Signup
// // -------------------------
// exports.patientSignup = async (req, res) => {
//   try {
//     const { name, email, password, profile } = req.body;

//     // Check if user exists
//     const existing = await User.findOne({ email });
//     if (existing)
//       return res.status(400).json({ message: "Email already registered" });

//     const newUser = await User.create({
//       name,
//       email,
//       password,
//       role: "patient",
//       profile, // optional
//     });

//     const token = generateToken(newUser);

//     res.status(201).json({
//       success: true,
//       message: "Patient registered successfully",
//       token,
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         role: newUser.role,
//         email: newUser.email,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // -------------------------
// // Doctor Signup
// // -------------------------
// exports.doctorSignup = async (req, res) => {
//   try {
//     const { name, email, password, doctorProfile } = req.body;

//     const existing = await User.findOne({ email });
//     if (existing)
//       return res.status(400).json({ message: "Email already registered" });

//     const newUser = await User.create({
//       name,
//       email,
//       password,
//       role: "doctor",
//       doctorProfile,
//     });

//     const token = generateToken(newUser);

//     res.status(201).json({
//       success: true,
//       message: "Doctor registered successfully",
//       token,
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         role: newUser.role,
//         email: newUser.email,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // -------------------------
// // LOGIN (Patient + Doctor)
// // -------------------------
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "User not found" });

//     const match = await user.comparePassword(password);
//     if (!match)
//       return res.status(401).json({ message: "Invalid password" });

//     const token = generateToken(user);

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         role: user.role,
//         email: user.email,
//         name: user.name,
//       },
//       // FE can redirect based on role
//       redirect: user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // -------------------------
// // Get User Profile
// // -------------------------
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");

//     res.status(200).json({
//       success: true,
//       user,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// export const forgotPasswordController = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     // You can add real email sending later
//     return res.json({
//       success: true,
//       message: "Password reset instructions sent (placeholder).",
//     });

//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };



// export const getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.json({
//       success: true,
//       user,
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { sendOTP } from "./otp.js";
import Otp from "../models/Otp.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { otpLimiter } from "../middleware/rateLimit.js";

// ----------------------------------------
// Helper: Generate JWT Token
// ----------------------------------------
export const registerController = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const normalizedRole = String(role || "").trim().toLowerCase();
    const safeRole = normalizedRole === "doctor" ? "doctor" : "patient";

    // CHECK REQUIRED FIELDS
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // CHECK IF USER EXISTS
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const user = await User.create({
      name: fullName,
      email,
      phone,
      password: hashedPassword,
      role: safeRole,
      registrationIp: req.ip || req.headers["x-forwarded-for"] || "",
      lastLoginIp: req.ip || req.headers["x-forwarded-for"] || "",
    });

    if (safeRole === "doctor") {
      await Doctor.findOneAndUpdate(
        { user: user._id },
        { $setOnInsert: { user: user._id } },
        { upsert: true }
      );
    }

    // GENERATE TOKEN
    user.loginAttempts = 0;
    user.lastLogin = new Date();
    user.lastLoginIp = req.ip || req.headers["x-forwarded-for"] || "";
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || "",
      },
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ----------------------------------------
// LOGIN
// ----------------------------------------
// export const loginController = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(400).json({ success: false, message: "Invalid credentials" });

//     const match = await user.comparePassword(password);
//     if (!match)
//       return res.status(400).json({ success: false, message: "Invalid credentials" });

//     user.loginAttempts = 0;
//     user.lastLogin = new Date();
//     user.lastLoginIp = req.ip || req.headers["x-forwarded-for"] || "";
//     await user.save();

//     const token = generateToken(user._id, user.role);

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         role: user.role,
//         email: user.email,
//       },
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

//import { sendOTP } from "./otp.js";

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account blocked by admin",
      });
    }

    if (user.role === "doctor" && user.doctorStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Doctor account has been rejected by admin",
      });
    }

    user.loginAttempts = 0;
    user.lastLogin = new Date();
    user.lastLoginIp = req.ip || req.headers["x-forwarded-for"] || "";
    await user.save();

    const token = generateToken(user._id, user.role);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ----------------------------------------
// FORGOT PASSWORD (dummy)
// ----------------------------------------


// ----------------------------------------
// GET CURRENT USER
// ----------------------------------------
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    // No real email service yet (placeholder)
    return res.json({
      success: true,
      message: "Password reset instructions sent (demo).",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMagicLink = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({ message: "User not found" });

  const tempToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const link = `http://localhost:3000/magic-login/${tempToken}`;

  await transporter.sendMail({
    to: email,
    subject: "Magic Login Link",
    text: `Click here to login: ${link}`,
  });

  res.json({ success: true, message: "Magic link sent" });
};

export const verifyMagicLink = async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user });
  } catch {
    res.status(400).json({ message: "Invalid or expired link" });
  }
};



