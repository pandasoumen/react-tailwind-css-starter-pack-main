// const express = require('express');
// const router = express.Router();
// const Product = require('../models/Product');

// // @route   GET /api/products
// // @desc    Get all products
// // @access  Public
// router.get('/', async (req, res) => {
//   try {
//     const { category } = req.query;

//     let query = {};
//     if (category) query.category = category;

//     const products = await Product.find(query);

//     res.json({ success: true, count: products.length, products });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @route   GET /api/products/:id
// // @desc    Get single product
// // @access  Public
// router.get('/:id', async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ success: false, message: 'Product not found' });
//     }

//     res.json({ success: true, product });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;


//const express = require('express');
import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/products.js";

const router = express.Router();

// PUBLIC: Get all products
router.get("/", getAllProducts);

// PUBLIC: Get a single product
router.get("/:id", getProductById);

// ADMIN: Create product
router.post("/", protect, authorize("admin"), createProduct);

// ADMIN: Update product
router.put("/:id", protect, authorize("admin"), updateProduct);

// ADMIN: Delete product
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
