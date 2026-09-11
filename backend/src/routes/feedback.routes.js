import { Router } from "express";
import {
  createFeedbackController,
  getApprovedReviewsController,
} from "../controllers/feedback.controller.js";
import { optionalAuthMiddleware } from "../middleware/auth.middleware.js";
import { feedbackSubmissionRateLimiter } from "../middleware/feedbackRateLimiter.js";

const feedbackRouter = Router();

// POST /api/feedback — authenticated users get userId attached; anonymous users are allowed
feedbackRouter.post(
  "/",
  feedbackSubmissionRateLimiter,
  optionalAuthMiddleware,
  createFeedbackController,
);

// GET /api/feedback/reviews — public endpoint for approved reviews on landing page
feedbackRouter.get("/reviews", getApprovedReviewsController);

export default feedbackRouter;
