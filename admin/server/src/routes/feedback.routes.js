import { Router } from "express";
import {
  deleteFeedbackController,
  getFeedbackByIdController,
  listFeedbackController,
  updateFeedbackStatusController,
} from "../controllers/feedback.controller.js";
import { adminAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validation.middleware.js";

const feedbackRouter = Router();

// Require authentication and admin role on all feedback endpoints
feedbackRouter.use(adminAuth, requireAdmin);

feedbackRouter.get("/", listFeedbackController);
feedbackRouter.get("/:id", validateObjectId("id"), getFeedbackByIdController);
feedbackRouter.patch("/:id/status", validateObjectId("id"), updateFeedbackStatusController);
feedbackRouter.delete("/:id", validateObjectId("id"), deleteFeedbackController);

export default feedbackRouter;
