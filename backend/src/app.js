import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";

// Import routers
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import aiRouter from "./routes/ai.routes.js";
import jobMatchRouter from "./routes/jobMatchRoutes.js";

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Handled by CloudFront/proxy header if needed
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(compression());

// Enable CORS with support for credentials (cookies)
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const isLocalhostOrigin = (origin) => {
  if (!origin) return false;
  if (process.env.NODE_ENV === "production") return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isLocalhostOrigin(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  }),
);

// Middleware for parsing JSON, URL-encoded bodies, and cookies (bounded size)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Serve static build assets from public (when running in Docker production)
app.use(express.static("public", {
  maxAge: "1y",
  immutable: true,
  setHeaders: (res, path) => {
    if (path.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache, must-revalidate");
    }
  },
}));

// Route registration
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);
app.use("/api/jobs", jobMatchRouter);

// Global Error Handler for uncaught middleware/controller exceptions
app.use((err, req, res, next) => {
  console.error("[App Error Handler] Uncaught error:", err.stack);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "An unexpected error occurred on the server.",
    code: err.code || "INTERNAL_SERVER_ERROR",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
