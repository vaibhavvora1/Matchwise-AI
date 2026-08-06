// routes/jobs.routes.js
import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { getResumeMatchedJobs } from "../services/resumeJobMatchService.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { jobMatchRateLimiter } from "../middleware/jobRateLimiter.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max upload limit
});

/**
 * Derives a user-facing warning message from the matchLevel returned by
 * getResumeMatchedJobs, so the frontend can surface it via jobsWarning.
 */
const deriveWarning = (matchLevel) => {
  if (matchLevel === "broad" || matchLevel === "widest") {
    return "Showing broader matches — exact-fit roles weren't found nearby.";
  }
  if (matchLevel === "none") {
    return "No matching jobs found right now.";
  }
  return undefined;
};

router.post(
  "/match",
  authMiddleware,
  jobMatchRateLimiter,
  upload.single("resume"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required." });
    }

    try {
      const uint8Data = new Uint8Array(req.file.buffer);
      const parser = new PDFParse(uint8Data);
      const { text: resumeText } = await parser.getText();

      if (!resumeText || !resumeText.trim()) {
        return res
          .status(422)
          .json({ message: "Could not extract text from resume." });
      }

      const result = await getResumeMatchedJobs(resumeText);
      return res.status(200).json({
        ...result,
        warning: deriveWarning(result.matchLevel),
      }); // { criteria, jobs, matchLevel, warning }
    } catch (error) {
      console.error("[jobs.routes] /match error:", error.message);
      return res.status(500).json({ message: "Failed to fetch matching jobs." });
    }
  },
);

router.post(
  "/match-text",
  authMiddleware,
  jobMatchRateLimiter,
  async (req, res) => {
    const { resumeText } = req.body;

    if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
      return res.status(400).json({ message: "resumeText is required." });
    }

    try {
      const result = await getResumeMatchedJobs(resumeText);
      return res.status(200).json({
        ...result,
        warning: deriveWarning(result.matchLevel),
      }); // { criteria, jobs, matchLevel, warning }
    } catch (error) {
      console.error("[jobs.routes] /match-text error:", error.message);
      return res.status(500).json({ message: "Failed to fetch matching jobs." });
    }
  },
);

export default router;
