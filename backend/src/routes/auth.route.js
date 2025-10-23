import express from "express";
import {
  login,
  logout,
  onboard,
  resendOTP,
  signup,
  verifyDeviceOTP,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);

router.post("/login", login);
router.post("/verify-device", verifyDeviceOTP);

router.post("/logout", logout);
router.post("/onboarding", protectRoute, onboard);

// Check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
