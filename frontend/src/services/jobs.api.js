import api from "./httpClient";

/**
 * Search for job vacancies matching the given resume text.
 * Sends the plain-text resume to the backend, which uses Gemini to extract
 * criteria and then queries JSearch to surface matching openings.
 * @param {string} resumeText - plain-text representation of the generated resume
 * @returns {Promise<{jobs: Array, warning?: string}>}
 */
export const getMatchingJobs = async (resumeText) => {
  const response = await api.post("/jobs/match-text", { resumeText });

  return {
    jobs: Array.isArray(response.data?.jobs) ? response.data.jobs : [],
    warning: response.data?.warning,
  };
};

export default api;
