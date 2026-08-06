import AnalysisHistory from "../models/analysisHistory.model.js";

/**
 * Persists an analysis result to AnalysisHistory.
 * Non-blocking by design — errors are logged but never bubble up to the request.
 *
 * @param {object} opts
 * @param {string}   opts.userId     - MongoDB ObjectId of the authenticated user
 * @param {"ats_resume"|"interview_report"} opts.type
 * @param {string}   opts.resumeName - Original filename or default label
 * @param {string}   opts.jobTitle   - Job title from request body
 * @param {string}   opts.company    - Company from request body
 * @param {number}   opts.matchScore - 0-100 numeric score
 * @param {string[]} opts.skills     - Top skills (max 10)
 * @param {object}   opts.reportData - Full AI report payload
 */
export async function saveAnalysisHistory({
  userId,
  type,
  resumeName,
  jobTitle,
  company,
  matchScore,
  skills,
  reportData,
}) {
  try {
    await AnalysisHistory.create({
      userId,
      type,
      resumeName: resumeName || "Resume Analysis",
      jobTitle: jobTitle || "Untitled Role",
      company: company || "—",
      matchScore: typeof matchScore === "number" ? matchScore : 0,
      skills: Array.isArray(skills) ? skills.slice(0, 10) : [],
      reportData,
    });
  } catch (err) {
    console.error("[History Service] Non-blocking save error:", err.message);
  }
}
