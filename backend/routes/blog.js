// const express = require('express');
// const router = express.Router();
// const BlogPost = require('../models/BlogPost');
// const { protect, authorize } = require('../middleware/auth');

// // @route   GET /api/blog
// // @desc    Get all published blog posts
// // @access  Public
// router.get('/', async (req, res) => {
//   try {
//     const posts = await BlogPost.find({ published: true })
//       .populate('author', 'name doctorProfile')
//       .sort('-createdAt');

//     res.json({ success: true, count: posts.length, posts });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @route   GET /api/blog/:id
// // @desc    Get single blog post
// // @access  Public
// router.get('/:id', async (req, res) => {
//   try {
//     const post = await BlogPost.findById(req.params.id).populate('author', 'name doctorProfile');
    
//     if (!post) {
//       return res.status(404).json({ success: false, message: 'Blog post not found' });
//     }

//     res.json({ success: true, post });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @route   POST /api/blog
// // @desc    Create blog post
// // @access  Private (Doctor only)
// router.post('/', protect, authorize('doctor', 'admin'), async (req, res) => {
//   try {
//     const { title, content, excerpt, category, tags, readTime } = req.body;

//     const post = await BlogPost.create({
//       author: req.user.id,
//       title,
//       content,
//       excerpt,
//       category,
//       tags,
//       readTime,
//       published: true
//     });

//     res.status(201).json({ success: true, post });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// //module.exports = router;
// export default router;

import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} from "../controllers/blog.js";

const router = express.Router();

// PUBLIC: Get all blog posts
router.get("/", getAllBlogs);

// PUBLIC: Get blog post by ID
router.get("/:id", getBlogById);

// DOCTOR: Create a blog post
router.post("/", protect, authorize("doctor"), createBlog);

// DOCTOR: Update blog post
router.put("/:id", protect, authorize("doctor"), updateBlog);

// DOCTOR or ADMIN: Delete blog post
router.delete("/:id", protect, authorize("doctor", "admin"), deleteBlog);

export default router;
