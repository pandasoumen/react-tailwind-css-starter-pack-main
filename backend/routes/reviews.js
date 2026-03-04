//const express = require('express');
import express from "express";
const router = express.Router();
//import router from express.Router();
import Review from "../models/Review.js";
//const Review = require('../models/Review');
//const User = require('../models/User');
import User from "../models/User.js";
//const { protect } = require('../middleware/auth');
import { protect } from "../middleware/auth.js";

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { doctor, rating, comment } = req.body;

    const review = await Review.create({
      user: req.user.id,
      doctor,
      rating,
      comment
    });

    // Update doctor rating
    if (doctor) {
      const reviews = await Review.find({ doctor });
      const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      
      await User.findByIdAndUpdate(doctor, {
        'doctorProfile.rating': avgRating,
        'doctorProfile.totalReviews': reviews.length
      });
    }

    const populatedReview = await Review.findById(review._id).populate('user', 'name');

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { doctor } = req.query;
    
    let query = {};
    if (doctor) query.doctor = doctor;

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//module.exports = router;
export default router;
