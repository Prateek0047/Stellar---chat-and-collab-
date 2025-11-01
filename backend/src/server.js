import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import path from "path";
import passport from "./lib/passport.js";

import { connectDB } from "./lib/db.js";
import { syncStreamUsers } from "./lib/scripts/syncStreamUsers.js";
import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import userRoutes from "./routes/user.route.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// ------------------ SESSION & PASSPORT ------------------
app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ------------------ SECURITY (Helmet) ------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "wss:",
          "https:",
          "http://localhost:*",
          "http://stellar-backend:5001",
          "stun:",
          "turn:",
          "https://*.stream-io-api.com",
          "https://*.getstream.io",
          "https://accounts.google.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://flagcdn.com",
          "https://avatar.iran.liara.run",
          "https://*.googleusercontent.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        mediaSrc: ["'self'", "blob:"],
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
  })
);

// ------------------ CORS (FIXED FOR DOCKER) ------------------
app.use(
  cors({
    origin: [
      "http://localhost",
      "http://localhost:80",
      "http://localhost:5173", // Vite dev server
      "http://stellar-frontend",
      "http://stellar-frontend:80",
    ],
    credentials: true,
  })
);

// ------------------ PARSERS ------------------
app.use(express.json());
app.use(cookieParser());

// ------------------ ROUTES ------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Note: Frontend is served by nginx in Docker, not by Express

// ------------------ SERVER STARTUP ------------------
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    // Only sync in development
    if (process.env.NODE_ENV !== "production") {
      await syncStreamUsers(
        process.env.STREAM_API_KEY,
        process.env.STREAM_API_SECRET
      );
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
