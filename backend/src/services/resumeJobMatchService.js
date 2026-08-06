import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { jsearchCache, geminiCriteriaCache } from "../utils/apiCache.js";
import crypto from "crypto";

const JSEARCH_BASE_URL = "https://jsearch.p.rapidapi.com";

const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Build a stable cache key from the resume text (first 2KB is sufficient for fingerprinting)
const hashResumeText = (text) =>
  crypto
    .createHash("sha256")
    .update(text.slice(0, 2048))
    .digest("hex")
    .slice(0, 16);

// STEP 1: Extract structured search criteria from resume text
// Results cached for 6 hours — same resume text will return the same criteria.
const extractSearchCriteria = async (resumeText) => {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is not set in the environment.");
  }

  // Return cached criteria if available
  const cacheKey = `criteria:${hashResumeText(resumeText)}`;
  const cached = geminiCriteriaCache.get(cacheKey);
  if (cached) {
    console.log("[ResumeMatch] Criteria served from cache");
    return cached;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analyze this resume and extract job search criteria.
Return ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{"jobTitle": "string", "skills": ["skill1", "skill2", "skill3"], "seniority": "entry|mid|senior"}

Resume:
${resumeText}`;

  let lastError;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    const maxAttemptsForThisModel = 2;

    for (let attempt = 1; attempt <= maxAttemptsForThisModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        const raw = (response?.text ?? "")
          .trim()
          .replace(/^```json\s*|```$/g, "");
        const parsed = JSON.parse(raw);

        if (!parsed.jobTitle || !Array.isArray(parsed.skills)) {
          throw new Error("Malformed criteria shape from model");
        }

        console.log(`[ResumeMatch] Success with model: ${modelName}`);
        geminiCriteriaCache.set(cacheKey, parsed);
        return parsed;
      } catch (err) {
        lastError = err;
        const message = err.message || "";
        const isTransientOverload =
          message.includes("UNAVAILABLE") || message.includes("503");

        if (isTransientOverload && attempt < maxAttemptsForThisModel) {
          console.warn(
            `[ResumeMatch] ${modelName} overloaded (attempt ${attempt}), retrying shortly...`,
          );
          await sleep(1500);
          continue;
        }

        console.warn(`[ResumeMatch] ${modelName} failed:`, message);
        break;
      }
    }
  }

  throw new Error(`All Gemini models failed: ${lastError?.message}`);
};

// ─── Compute a 0-100 match score for a single job against the resume's criteria ───
// Combines: % of resume skills found in the job's text (title + description + requirements),
// plus a small bonus if the job title shares words with the resume's target job title.
const computeMatchScore = (rawJob, criteria) => {
  const skills = Array.isArray(criteria?.skills) ? criteria.skills : [];
  if (skills.length === 0) return null;

  const haystackParts = [
    rawJob.job_title,
    rawJob.job_description,
    ...(Array.isArray(rawJob.job_required_skills)
      ? rawJob.job_required_skills
      : []),
    ...(Array.isArray(rawJob.job_highlights?.Qualifications)
      ? rawJob.job_highlights.Qualifications
      : []),
    ...(Array.isArray(rawJob.job_highlights?.Requirements)
      ? rawJob.job_highlights.Requirements
      : []),
  ];
  const haystack = haystackParts.filter(Boolean).join(" ").toLowerCase();

  if (!haystack.trim()) return null;

  const matchedSkills = skills.filter((skill) =>
    haystack.includes(String(skill).toLowerCase()),
  );
  const skillScore = (matchedSkills.length / skills.length) * 100;

  // Small title-overlap bonus (up to +10), so an exact-title job edges above a loosely related one
  const titleWords = (criteria.jobTitle || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const jobTitleLower = (rawJob.job_title || "").toLowerCase();
  const titleOverlap = titleWords.filter((w) =>
    jobTitleLower.includes(w),
  ).length;
  const titleBonus =
    titleWords.length > 0 ? (titleOverlap / titleWords.length) * 10 : 0;

  const finalScore = Math.min(100, Math.round(skillScore * 0.9 + titleBonus));
  return finalScore;
};

// ─── Normalize a raw JSearch job object to the shape the frontend expects ───
const normalizeJob = (rawJob, criteria) => ({
  jobId: rawJob.job_id,
  title: rawJob.job_title,
  company: rawJob.employer_name,
  location: [rawJob.job_city, rawJob.job_country].filter(Boolean).join(", "),
  postedDate: rawJob.job_posted_at_datetime_utc,
  applyLink: rawJob.job_apply_link,
  matchScore: computeMatchScore(rawJob, criteria),
});

// STEP 2: Search JSearch using the extracted criteria, scoped to India,
// broadening the query progressively if no results are found.
//
// IMPORTANT: JSearch nests the actual job array under data.data.jobs,
// not data.data directly. data.data is an object: { jobs: [...], cursor: "..." }
const runJSearchQuery = async (query, datePosted, criteria) => {
  // Check cache first — same query+datePosted combo returns cached results for 1 hour
  const cacheKey = `jsearch:${query}:${datePosted}`;
  const cached = jsearchCache.get(cacheKey);
  if (cached) {
    console.log(`[ResumeMatch] JSearch cache hit: "${query}" | ${datePosted}`);
    // Re-score against current criteria (criteria may differ between callers)
    return cached.map((rawJob) => normalizeJob(rawJob, criteria));
  }

  const { data } = await axios.get(`${JSEARCH_BASE_URL}/search-v2`, {
    params: {
      query,
      page: 1,
      num_pages: 1,
      country: "in",
      date_posted: datePosted,
    },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
    timeout: 20000,
  });

  console.log(
    "[ResumeMatch] JSearch query:",
    query,
    "| date_posted:",
    datePosted,
    "| status:",
    data?.status,
  );

  const jobs = data?.data?.jobs;
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  console.log("[ResumeMatch] jobs array length:", safeJobs.length);

  // Cache raw job objects so re-scoring is possible for different criteria
  if (safeJobs.length > 0) {
    jsearchCache.set(cacheKey, safeJobs);
  }

  return safeJobs.map((rawJob) => normalizeJob(rawJob, criteria));
};

const searchMatchingJobs = async (criteria) => {
  // Attempt 1: precise query — title + top skills, scoped to last week
  const preciseQuery = `${criteria.jobTitle} ${criteria.skills.slice(0, 2).join(" ")} in India`;
  let jobs = await runJSearchQuery(preciseQuery, "week", criteria);

  if (jobs.length > 0) {
    console.log("[ResumeMatch] Matched on precise query:", jobs.length);
    return { jobs, matchLevel: "precise" };
  }

  // Attempt 2: broaden — drop skills, widen the date window
  console.warn("[ResumeMatch] Precise query returned 0 results, broadening...");
  const broadQuery = `${criteria.jobTitle} in India`;
  jobs = await runJSearchQuery(broadQuery, "month", criteria);

  if (jobs.length > 0) {
    console.log("[ResumeMatch] Matched on broadened query:", jobs.length);
    return { jobs, matchLevel: "broad" };
  }

  // Attempt 3: widest — strip seniority modifiers, no date filter
  console.warn("[ResumeMatch] Broadened query still 0, trying widest query...");
  const coreTitle = criteria.jobTitle.replace(
    /^(junior|senior|mid[- ]level|entry[- ]level)\s+/i,
    "",
  );
  const widestQuery = `${coreTitle} in India`;
  jobs = await runJSearchQuery(widestQuery, "all", criteria);

  console.log("[ResumeMatch] Final jobs count returned:", jobs.length);
  return { jobs, matchLevel: jobs.length > 0 ? "widest" : "none" };
};

export const getResumeMatchedJobs = async (resumeText) => {
  const criteria = await extractSearchCriteria(resumeText);
  console.log("[ResumeMatch] Criteria:", criteria);

  try {
    const { jobs, matchLevel } = await searchMatchingJobs(criteria);
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    console.log(
      "[ResumeMatch] Final jobs count returned:",
      safeJobs.length,
      "| matchLevel:",
      matchLevel,
    );
    return { criteria, jobs: safeJobs, matchLevel };
  } catch (error) {
    console.error("[ResumeMatch] JSearch error:", error.message);
    console.error(
      "[ResumeMatch] JSearch error full response:",
      error.response?.data,
    );
    return { criteria, jobs: [], matchLevel: "error" };
  }
};
