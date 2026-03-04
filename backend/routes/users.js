import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  updateProfileImage,
} from "../controllers/users.js";
import { authorize } from "../middleware/authorize.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Get all users (admin only - optional)
router.get("/all", protect,  authorize("admin"), getAllUsers);

// Get one user
router.get("/:id", protect, getUserById);

// Update logged-in user profile
router.put("/me", protect, updateProfile);
router.put("/profile-image", protect, upload.single("profileImage"), updateProfileImage);

export default router;
