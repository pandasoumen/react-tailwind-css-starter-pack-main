import express from "express";
import { protect } from "../middleware/auth.js";
import {
  completeBloodRequest,
  createBloodRequest,
  getDonationHistory,
  getIncomingRequests,
  getMyNotifications,
  getMySentRequests,
  respondBloodRequest,
} from "../controllers/bloodRequest.js";

const router = express.Router();

router.use(protect);

router.post("/", createBloodRequest);
router.get("/incoming", getIncomingRequests);
router.get("/mine", getMySentRequests);
router.get("/history", getDonationHistory);
router.get("/notifications", getMyNotifications);
router.patch("/:id/respond", respondBloodRequest);
router.patch("/:id/complete", completeBloodRequest);

export default router;
