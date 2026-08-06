import { PDFParse } from "pdf-parse";
import { readFile } from "fs/promises";
import {
  generateInterviewReport,
  generateATSResume,
} from "../services/ai.service.js";
import { saveAnalysisHistory } from "../services/history.service.js";

// ─── Shared PDF parsing helper ─────────────────────────────────────────────
// Handles both memory-based (multer memoryStorage) and disk-based uploads.
// Falls back to raw UTF-8 if PDF parsing fails.
const parseUploadedResume = async (req) => {
  if (!req.file) {
    return req.body.resume;
  }

  let fileBuffer = req.file.buffer;

  if (!fileBuffer && req.file.path) {
    try {
      fileBuffer = await readFile(req.file.path);
    } catch (err) {
      console.warn(
        "[AI Controller] Failed to read uploaded file from disk:",
        err.message,
      );
      return undefined;
    }
  }

  if (fileBuffer) {
    try {
      const uint8Data = new Uint8Array(fileBuffer);
      const parser = new PDFParse(uint8Data);
      const { text } = await parser.getText();
      return text?.trim();
    } catch (err) {
      console.warn(
        "[AI Controller] PDF parsing failed, falling back to raw upload.",
        err.message,
      );
      return fileBuffer.toString("utf-8");
    }
  }

  return undefined;
};

// ─── Analyze flow (Interview Report) ───────────────────────────────────────
// Mandatory: resume (uploaded file OR text body field), jobDescription, selfDescription.
// Also used by the frontend as a background call right after resume generation,
// passing the generated resume as plain text in the "resume" body field (no file).
export async function generateInterviewReportController(req, res) {
  try {
    const resume = (await parseUploadedResume(req)) || undefined;
    const jobDescription = req.body.jobDescription;
    const selfDescription =
      req.body.selfDescription ?? req.body.selfDeclaration;

    if (!resume || !jobDescription || !selfDescription) {
      return res.status(400).json({
        success: false,
        message:
          "Resume file, job description, and self description are required.",
      });
    }

    const report = await generateInterviewReport({
      resume,
      jobDescription,
      selfDescription,
    });

    // Persist to analysis history (non-blocking — fires and doesn't await)
    saveAnalysisHistory({
      userId: req.user.id,
      type: "interview_report",
      resumeName: req.file?.originalname || "Resume",
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      matchScore: report?.matchScore,
      skills: Array.isArray(report?.skillsGaps)
        ? report.skillsGaps.map((s) => s.skill).filter(Boolean)
        : [],
      reportData: report,
    });

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(
      "[AI Controller] Interview report error:",
      error?.message || error,
    );
    res.status(503).json({
      success: false,
      message: "AI service is currently unavailable. Please try again later.",
      error:
        process.env.NODE_ENV === "development"
          ? error?.message || error
          : undefined,
    });
  }
}

// ─── Generate Resume flow ──────────────────────────────────────────────────
// Mandatory: jobDescription, selfDescription. Resume upload is OPTIONAL.
// Responds as soon as the resume is generated — does NOT wait on analysis.
// The frontend triggers analysis separately, in the background, right after this resolves.
export async function generateATSResumeController(req, res) {
  try {
    const resume = (await parseUploadedResume(req)) || undefined;
    const jobDescription = req.body.jobDescription;
    const selfDescription =
      req.body.selfDescription ?? req.body.selfDeclaration;

    if (!jobDescription || !selfDescription) {
      return res.status(400).json({
        success: false,
        message: "Job description and self description are required.",
      });
    }

    const optimizedResume = await generateATSResume({
      resume, // optional — may be undefined
      jobDescription,
      selfDescription,
    });

    // Persist to analysis history (non-blocking — fires and doesn't await)
    saveAnalysisHistory({
      userId: req.user.id,
      type: "ats_resume",
      resumeName: req.file?.originalname || "Generated Resume",
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      matchScore: optimizedResume?.atsReport?.score,
      skills: Array.isArray(optimizedResume?.resume?.skills?.technical)
        ? optimizedResume.resume.skills.technical
        : [],
      reportData: optimizedResume,
    });

    res.status(200).json({ success: true, optimizedResume });
  } catch (error) {
    console.error("[AI Controller] ATS resume error:", error?.message || error);
    res.status(503).json({
      success: false,
      message:
        "AI resume generation is currently unavailable. Please try again later.",
      error:
        process.env.NODE_ENV === "development"
          ? error?.message || error
          : undefined,
    });
  }
}
