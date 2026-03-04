
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const { protect } = require('../middleware/auth');

// // @route   PUT /api/patients/profile
// // @desc    Update patient profile
// // @access  Private
// router.put('/profile', protect, async (req, res) => {
//   try {
//     const { age, gender, phone, address, city, country, bloodGroup, healthGoal, medicalConditions } = req.body;

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     user.profile = {
//       age: age || user.profile.age,
//       gender: gender || user.profile.gender,
//       phone: phone || user.profile.phone,
//       address: address || user.profile.address,
//       city: city || user.profile.city,
//       country: country || user.profile.country,
//       bloodGroup: bloodGroup || user.profile.bloodGroup,
//       healthGoal: healthGoal || user.profile.healthGoal,
//       medicalConditions: medicalConditions || user.profile.medicalConditions
//     };

//     await user.save();

//     res.json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @route   GET /api/patients/profile
// // @desc    Get patient profile
// // @access  Private
// router.get('/profile', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;
import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  getMyPatientProfile,
  updateMyPatientProfile,
  listPatients,
  getPatientById
} from "../controllers/patients.js";

const router = express.Router();

// PATIENT: View own profile
router.get("/me/profile", protect, authorize("patient"), getMyPatientProfile);

// PATIENT: Update own profile
router.put("/me/profile", protect, authorize("patient"), updateMyPatientProfile);

// ADMIN / DOCTOR: Get all patients
router.get("/", protect, listPatients);

// ADMIN / DOCTOR: Get patient details
router.get("/:id", protect, getPatientById);

export default router;
