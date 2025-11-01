// backend/src/routes/auth.route.js
import express from "express";
import jwt from "jsonwebtoken"; // ✅ Add this at the top
import {
  login,
  logout,
  onboard,
  resendOTP,
  signup,
  verifyDeviceOTP,
  verifyEmail,
} from "../controllers/auth.controller.js";
import passport from "../lib/passport.js"; // Make sure this exists
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Existing routes
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/verify-device", verifyDeviceOTP);
router.post("/logout", logout);
router.post("/onboarding", protectRoute, onboard);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { session: false }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax", // Change from "strict" to "lax" for OAuth
      secure: process.env.NODE_ENV === "production",
    });

    const redirectUrl = req.user.isOnboarded ? "/" : "/onboarding";

    // In Docker, just redirect to relative path
    res.redirect(redirectUrl);
  }
);

// Check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
