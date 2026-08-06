import { getResumeMatchedJobs } from "../services/resumeJobMatchService.js";

export const matchJobsFromResume = async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || resumeText.trim().length < 50) {
    return res
      .status(400)
      .json({ message: "resumeText is required and must be substantial" });
  }

  try {
    const { criteria, jobs } = await getResumeMatchedJobs(resumeText);
    const normalizedJobs = jobs.map((j) => ({
      jobId:      j.job_id,
      title:      j.job_title,
      company:    j.employer_name,
      location:   j.job_city || j.job_country || '',
      applyLink:  j.job_apply_link,
      postedDate: j.job_posted_at_datetime_utc || null,
    }));
    return res.status(200).json({ criteria, jobs: normalizedJobs, count: normalizedJobs.length });
  } catch (error) {
    console.error("[JobMatchController] Error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to match jobs from resume" });
  }
};
