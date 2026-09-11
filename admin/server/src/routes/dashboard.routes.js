import { Router } from "express";
import { getDashboardStatsController } from "../controllers/dashboard.controller.js";
import { adminAuth, requireAdmin } from "../middleware/auth.middleware.js";

const dashboardRouter = Router();

// Require authentication and admin role for all dashboard metrics
dashboardRouter.use(adminAuth, requireAdmin);

dashboardRouter.get("/stats", getDashboardStatsController);

export default dashboardRouter;
