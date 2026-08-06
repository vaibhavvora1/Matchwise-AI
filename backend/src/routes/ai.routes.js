import { Router } from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import {
  generateResumeSchema,
  analyzeResumeSchema,
} from "../schema/Ats.schema.js";
import {
  generateInterviewReportController,
  generateATSResumeController,
} from "../controllers/ai.controller.js";

const aiRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route POST /api/ai/interview-report
 * @desc Generate an interview preparation report on demand
 * @access Private (Requires valid Access Token)
 * @body resume (required, uploaded file or text), jobDescription (required), selfDescription (required)
 */
aiRouter.post(
  "/interview-report",
  authMiddleware,
  upload.single("resume"),
  validateRequest(analyzeResumeSchema),
  generateInterviewReportController,
);

/**
 * @route POST /api/ai/ats-resume
 * @desc Generate an ATS-optimized resume on demand (resume upload optional),
 *       then automatically run it through interview-report analysis
 * @access Private (Requires valid Access Token)
 * @body jobDescription (required), selfDescription (required), resume (optional)
 */
aiRouter.post(
  "/ats-resume",
  authMiddleware,
  upload.single("resume"),
  validateRequest(generateResumeSchema),
  generateATSResumeController,
);

export default aiRouter;
