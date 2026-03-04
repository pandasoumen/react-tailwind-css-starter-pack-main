import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  listDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from "../controllers/doctors.js";

const router = express.Router();

// PUBLIC - list all doctors
router.get("/", listDoctors);

// DOCTOR ONLY - get own profile
router.get("/me/profile", protect, authorize("doctor"), getMyDoctorProfile);

// DOCTOR ONLY - update own profile
router.put("/me/profile", protect, authorize("doctor"), updateMyDoctorProfile);

// PUBLIC - get doctor details
router.get("/:id", getDoctorById);

export default router;
