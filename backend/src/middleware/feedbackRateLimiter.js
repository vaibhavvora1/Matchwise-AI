import rateLimit from "express-rate-limit";

const feedbackRateLimitMessage = {
  success: false,
  message: "Too many feedback submissions. Please wait a bit and try again.",
  code: "RATE_LIMIT_EXCEEDED",
};

export const feedbackSubmissionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: feedbackRateLimitMessage,
});
