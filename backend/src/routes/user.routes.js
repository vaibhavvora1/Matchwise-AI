import { Router } from "express";
import {
  getUserAggregationController,
  getUserProfilecontroller,
} from "../controllers/user.controller.js";
import {
  getUserHistoryController,
  getHistoryItemController,
  deleteHistoryItemController,
} from "../controllers/history.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const userRouter = Router();

/** @route GET /api/user/profile — Get authenticated user profile */
userRouter.get("/profile", authMiddleware, getUserProfilecontroller);

/** @route GET /api/user/aggregation — Get aggregate user stats */
userRouter.get("/aggregation", authMiddleware, getUserAggregationController);

/** @route GET /api/user/history — Get paginated analysis history */
userRouter.get("/history", authMiddleware, getUserHistoryController);

/** @route GET /api/user/history/:id — Get full report data for a history item */
userRouter.get("/history/:id", authMiddleware, getHistoryItemController);

/** @route DELETE /api/user/history/:id — Delete a history item */
userRouter.delete("/history/:id", authMiddleware, deleteHistoryItemController);

export default userRouter;
