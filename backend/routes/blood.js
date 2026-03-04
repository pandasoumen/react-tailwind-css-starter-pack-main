import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getMyDonorProfile,
  registerOrUpdateDonor,
  searchDonors,
  updateMyDonorAvailability,
} from "../controllers/blood.js";

const router = express.Router();

router.get("/search", searchDonors);
router.get("/me", protect, getMyDonorProfile);
router.post("/register", protect, registerOrUpdateDonor);
router.patch("/availability", protect, updateMyDonorAvailability);

export default router;
