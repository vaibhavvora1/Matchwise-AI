import rateLimit from "express-rate-limit";

const jobRateLimitMessage = {
  success: false,
  message:
    "Too many job search requests from this IP. Please try again after 15 minutes.",
  code: "RATE_LIMIT_EXCEEDED",
};

/**
 * Limits resume-based job match requests (Gemini + JSearch calls are costly).
 *
 * @type {import("express-rate-limit").RateLimitRequestHandler}
 */
export const jobMatchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: jobRateLimitMessage,
});
