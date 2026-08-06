import api from "./httpClient";

const safeParseJson = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*)```$/i);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return value;
      }
    }
    return value;
  }
};

/**
 * Generate ATS-optimized resume
 * @param {File} resumeFile - PDF file
 * @param {string} jobDescription - job description text
 * @param {string} selfDescription - self description text
 */
export const generateATSResume = async (
  resumeFile,
  jobDescription,
  selfDescription,
) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);

  const response = await api.post("/ai/ats-resume", formData);
  const payload =
    safeParseJson(response.data.optimizedResume) ||
    safeParseJson(response.data);

  return payload;
};

/**
 * Generate interview preparation report
 * @param {File} resumeFile - PDF file
 * @param {string} jobDescription - job description text
 * @param {string} selfDescription - self description text
 */
export const generateInterviewReport = async (
  resumeFile,
  jobDescription,
  selfDescription,
) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);

  const response = await api.post("/ai/interview-report", formData);
  const payload =
    safeParseJson(response.data.report) || safeParseJson(response.data);

  return payload;
};

/**
 * Find jobs matching a resume
 * @param {File} resumeFile - PDF file
 */
export const matchJobs = async (resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  const response = await api.post("/jobs/match", formData);
  return response.data; // { criteria, jobs, matchLevel }
};

/**
 * Find jobs matching resume text directly (used after ATS resume generation,
 * where the resume already exists as structured/plain text rather than a File)
 * @param {string} resumeText
 */
export const matchJobsFromText = async (resumeText) => {
  const response = await api.post("/jobs/match-text", { resumeText });
  return response.data; // { criteria, jobs, matchLevel }
};

export default api;
