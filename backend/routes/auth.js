
// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const { body, validationResult } = require('express-validator');
// const User = require('../models/User');
// const { protect } = require('../middleware/auth');

// // Generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '2d' });
// };

// // @route   POST /api/auth/register
// // @desc    Register a new user
// // @access  Public
// router.post('/register', [
//   body('name').notEmpty().withMessage('Name is required'),
//   body('email').isEmail().withMessage('Please provide a valid email'),
//   body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { name, email, password, role } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: 'User already exists' });
//     }

//     // Create user
//     const user = await User.create({ name, email, password, role: role || 'patient' });

//     res.status(201).json({
//       success: true,
//       token: generateToken(user._id),
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @route   POST /api/auth/login
// // @desc    Login user
// // @access  Public
// router.post('/login', [
//   body('email').isEmail().withMessage('Please provide a valid email'),
//   body('password').notEmpty().withMessage('Password is required')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { email, password } = req.body;

//     // Check user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     res.json({
//       success: true,
//       token: generateToken(user._id),
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         profile: user.profile
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @route   GET /api/auth/me
// // @desc    Get current user
// // @access  Private
// router.get('/me', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;


import express from "express";
import {
  registerController,
  loginController,
  forgotPasswordController,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

import {
  sendMagicLink,
  verifyMagicLink,
} from "../controllers/authController.js";


const router = express.Router();

// REGISTER (doctor or patient depending on role)
router.post("/register", registerController);

// LOGIN
router.post("/login", loginController);

// FORGOT PASSWORD (optional)
router.post("/forgot-password", forgotPasswordController);

// GET CURRENT USER
router.get("/me", protect, getMe);

// OTP LOGIN
router.post("/magic-link", sendMagicLink);
router.get("/magic-login/:token", verifyMagicLink);

export default router;
