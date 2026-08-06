import rateLimit from "express-rate-limit";

const authRateLimitMessage = {
  success: false,
  message:
    "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  code: "RATE_LIMIT_EXCEEDED",
};

const createAuthRateLimiter = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: authRateLimitMessage,
  });

/**
 * Applies a general limit for all auth endpoints.
 *
 * @type {import("express-rate-limit").RateLimitRequestHandler}
 */
export const authRateLimiter = createAuthRateLimiter(100);

/**
 * Limits login attempts to reduce password spraying and credential stuffing.
 *
 * @type {import("express-rate-limit").RateLimitRequestHandler}
 */
export const loginRateLimiter = createAuthRateLimiter(10);

/**
 * Limits refresh attempts to reduce token abuse and replay pressure.
 *
 * @type {import("express-rate-limit").RateLimitRequestHandler}
 */
export const refreshRateLimiter = createAuthRateLimiter(30);
