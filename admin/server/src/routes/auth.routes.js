import { Router } from "express";
import {
  getMeAdminController,
  loginAdminController,
  registerAdminController,
  logoutAdminController,
  refreshAdminController,
} from "../controllers/auth.controller.js";
import { adminAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { adminLoginLimiter } from "../middleware/rateLimiter.middleware.js";

const authRouter = Router();

// Publicly accessible admin endpoints (rate-limited)
authRouter.post("/register", adminLoginLimiter, registerAdminController);
authRouter.post("/login", adminLoginLimiter, loginAdminController);
authRouter.post("/refresh", refreshAdminController);

// Protected admin endpoints
authRouter.post("/logout", adminAuth, logoutAdminController);
authRouter.get("/me", adminAuth, requireAdmin, getMeAdminController);

export default authRouter;
