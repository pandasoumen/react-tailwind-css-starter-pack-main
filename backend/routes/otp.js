// import { otpLimiter, router } from "../middleware/rateLimit.js";

// router.post("/send", otpLimiter, sendOTP);
// router.post("/verify", verifyOTP);

// export default router;

import express from "express";
import { sendOTP, verifyOTP } from "../controllers/otp.js";

const router = express.Router();

router.post("/send", sendOTP);
router.post("/verify", verifyOTP);

export default router;
