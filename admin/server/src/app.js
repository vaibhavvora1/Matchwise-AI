import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";

// Import routers
import authRouter from "./routes/auth.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import feedbackRouter from "./routes/feedback.routes.js";
import userRouter from "./routes/user.routes.js";
import activityRouter from "./routes/activity.routes.js";

// Middlewares
import { adminApiLimiter } from "./middleware/rateLimiter.middleware.js";
import errorHandler from "./middleware/errorHandler.middleware.js";

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(compression());

// CORS configuration restricted to Admin Frontend
const allowedOrigins = [
  process.env.ADMIN_CLIENT_URL,
  "http://localhost:3001",
  "http://127.0.0.1:3001",
].filter(Boolean);

const isLocalhostOrigin = (origin) => {
  if (!origin) return false;
  if (process.env.NODE_ENV === "production") return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isLocalhostOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: Not allowed by Admin Server CORS policy"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  }),
);

// Payload parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Apply rate limiter to all admin API routes
app.use("/api/admin", adminApiLimiter);

// Health check endpoint
app.get("/api/admin/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "MatchWise Admin Server",
    timestamp: new Date().toISOString(),
  });
});

// Admin Route registration
app.use("/api/admin/auth", authRouter);
app.use("/api/admin/dashboard", dashboardRouter);
app.use("/api/admin/feedback", feedbackRouter);
app.use("/api/admin/users", userRouter);
app.use("/api/admin/activity", activityRouter);

// 404 Handler for undefined admin routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Admin API endpoint '${req.originalUrl}' not found.`,
    code: "NOT_FOUND",
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
