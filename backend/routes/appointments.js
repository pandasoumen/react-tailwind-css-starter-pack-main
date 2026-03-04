import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  bookAppointment,
  createRazorpayOrder,
  getAppointments,
  verifyRazorpayAndBookAppointment,
  updateAppointmentStatus,
  getMyAppointments,
} from "../controllers/appointments.js";

const router = express.Router();

// PATIENT books appointment
router.post("/book", protect, authorize("patient"), bookAppointment);
router.post("/create-order", protect, authorize("patient"), createRazorpayOrder);
router.post("/verify", protect, authorize("patient"), verifyRazorpayAndBookAppointment);

// DOCTOR or PATIENT view appointments
router.get("/", protect, getAppointments);

// Update appointment status (doctor only)
router.put(
  "/status/:id",
  protect,
  authorize("doctor"),
  updateAppointmentStatus
);

// Patient checks their own appointments
router.get("/me", protect, getMyAppointments);

export default router;
