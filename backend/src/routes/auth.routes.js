import { Router } from "express";
import {
  registerUsercontroller,
  loginUsercontroller,
  refreshUsercontroller,
  logoutUsercontroller,
  logoutAllDevicescontroller,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import csrfMiddleware from "../middleware/csrf.middleware.js";
import {
  authRateLimiter,
  loginRateLimiter,
  refreshRateLimiter,
} from "../middleware/Authlimiter.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post("/register", authRateLimiter, registerUsercontroller);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user credentials, set cookies, and return in-memory tokens.
 *       Protected by login rate limiting.
 * @access Public
 */
authRouter.post("/login", loginRateLimiter, loginUsercontroller);

/**
 * @route POST /api/auth/refresh
 * @desc Retrieve a new Access Token and CSRF Token using the Refresh Token cookie.
 *       Protected by refresh rate limiting and the refresh-token cookie itself.
 * @access Public (cookie-authenticated)
 */
authRouter.post("/refresh", refreshRateLimiter, refreshUsercontroller);

/**
 * @route POST /api/auth/logout
 * @desc Revoke the current refresh token and clear cookies.
 *       Protected by csrfMiddleware.
 * @access Public (cookie-authenticated, CSRF-protected)
 */
authRouter.post("/logout", csrfMiddleware, logoutUsercontroller);

/**
 * @route POST /api/auth/logout-all
 * @desc Revoke all user refresh tokens across all devices.
 *       Protected by authMiddleware and csrfMiddleware.
 * @access Private (Requires active Access Token, CSRF-protected)
 */
authRouter.post(
  "/logout-all",
  authMiddleware,
  csrfMiddleware,
  logoutAllDevicescontroller,
);

export default authRouter;
