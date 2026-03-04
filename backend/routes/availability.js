import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { setAvailability, getAvailability } from "../controllers/availability.js";

const router = express.Router();

// Doctor can SET availability
router.post("/", protect, authorize("doctor"), setAvailability);

// Anyone logged in can VIEW availability
router.get("/", protect, getAvailability);



export default router;
