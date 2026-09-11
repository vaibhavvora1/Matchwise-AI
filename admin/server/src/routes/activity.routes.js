import { Router } from "express";
import {
  getActivityStatsController,
  getUserActivitiesController,
  listActivitiesController,
} from "../controllers/activity.controller.js";
import { adminAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validation.middleware.js";

const activityRouter = Router();

// Require admin authentication and admin role for all activity endpoints
activityRouter.use(adminAuth, requireAdmin);

// GET /api/admin/activity — List all activities with search/filter/pagination
activityRouter.get("/", listActivitiesController);

// GET /api/admin/activity/stats — Aggregated metrics
activityRouter.get("/stats", getActivityStatsController);

// GET /api/admin/activity/user/:id — User specific activity timeline
activityRouter.get("/user/:id", validateObjectId("id"), getUserActivitiesController);

export default activityRouter;
