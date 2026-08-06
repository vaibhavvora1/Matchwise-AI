import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
];
const RETRYABLE_STATUS_CODES = new Set([503, 429]);

// ─── JSON parsing helpers ─────────────────────────────────────────────────────
const parseModelJson = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Empty response received from AI model.");
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        throw new Error(
          "AI response was not valid JSON (fenced block also failed to parse).",
        );
      }
    }
    throw new Error("AI response was not valid JSON.");
  }
};

/**
 * Converts a Zod schema into a Gemini-compatible response schema.
 *
 * IMPORTANT: this project has Zod v4 installed. The third-party
 * `zod-to-json-schema` package only understands Zod v3's internal `_def`
 * shape — against a v4 schema it silently returns `{}`, which means Gemini
 * receives no real constraints at all. Zod v4 ships its own converter
 * (`z.toJSONSchema`), so we use that instead.
 *
 * Gemini's structured-output schema only supports a subset of JSON Schema
 * (type, format, description, nullable, enum, items, properties, required,
 * minItems/maxItems, propertyOrdering). It rejects unknown keywords like
 * "$schema" and "additionalProperties" (added by default, at every nesting
 * level, by z.toJSONSchema). We strip those recursively before sending.
 */
const UNSUPPORTED_GEMINI_SCHEMA_KEYS = new Set([
  "$schema",
  "additionalProperties",
]);

const stripUnsupportedSchemaKeys = (node) => {
  if (Array.isArray(node)) {
    return node.map(stripUnsupportedSchemaKeys);
  }
  if (node && typeof node === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(node)) {
      if (UNSUPPORTED_GEMINI_SCHEMA_KEYS.has(key)) continue;
      cleaned[key] = stripUnsupportedSchemaKeys(value);
    }
    return cleaned;
  }
  return node;
};

const toGeminiSchema = (zodSchema) => {
  const schema = z.toJSONSchema(zodSchema);
  return stripUnsupportedSchemaKeys(schema);
};

// ─── Contact-info extraction / fallback (ATS resume) ─────────────────────────
const extractResumeContactInfo = (resumeText) => {
  if (typeof resumeText !== "string") return {};

  const cleanLine = (line) => line.replace(/[\u00A0\t\r]+/g, " ").trim();
  const lines = resumeText.split(/\r?\n/).map(cleanLine).filter(Boolean);

  const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  const phoneRegex = /(?:\+?\d[\d\s\-().]{7,}\d)/;
  const linkedinRegex = /(https?:\/\/)?(www\.)?linkedin\.com\/[\w\-\/]+/i;
  const locationRegex =
    /^[A-Za-z][A-Za-z\s]*(?:[,\-]\s*[A-Za-z][A-Za-z\s]*){1,3}$/;

  const emailLine = lines.find((line) => emailRegex.test(line));
  const phoneLine = lines.find((line) => phoneRegex.test(line));
  const linkedinLine = lines.find((line) => linkedinRegex.test(line));
  const locationLine = lines.find(
    (line) =>
      !emailRegex.test(line) &&
      !phoneRegex.test(line) &&
      !linkedinRegex.test(line) &&
      locationRegex.test(line) &&
      line.length <= 60,
  );

  const contactIndices = [emailLine, phoneLine, linkedinLine]
    .map((line) => (line ? lines.indexOf(line) : -1))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);

  const nameLine =
    contactIndices.length > 0 && contactIndices[0] > 0
      ? lines[contactIndices[0] - 1]
      : lines[0] || "";

  return {
    name: nameLine || "",
    email: emailLine || "",
    phone: phoneLine || "",
    linkedin: linkedinLine ? linkedinLine.trim() : "",
    location: locationLine || "",
  };
};

const isPlaceholderContactValue = (value) => {
  if (typeof value !== "string") return true;
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized === "..." ||
    normalized === "n/a" ||
    normalized === "none" ||
    normalized === "not provided" ||
    normalized === "candidate name" ||
    normalized === "name" ||
    normalized.includes("example") ||
    normalized.includes("placeholder")
  );
};

const fillResumeContactFallback = (parsedResponse, originalResumeText) => {
  const extracted = extractResumeContactInfo(originalResumeText);
  const resume = parsedResponse?.resume || parsedResponse;

  if (!resume || typeof resume !== "object") return parsedResponse;

  const contact = resume.contact || {};

  const mergedContact = {
    email:
      isPlaceholderContactValue(contact.email) && extracted.email
        ? extracted.email
        : contact.email || "",
    phone:
      isPlaceholderContactValue(contact.phone) && extracted.phone
        ? extracted.phone
        : contact.phone || "",
    location:
      isPlaceholderContactValue(contact.location) && extracted.location
        ? extracted.location
        : contact.location || "",
    linkedin:
      isPlaceholderContactValue(contact.linkedin) && extracted.linkedin
        ? extracted.linkedin
        : contact.linkedin || "",
  };

  const mergedName =
    isPlaceholderContactValue(resume.name) && extracted.name
      ? extracted.name
      : resume.name || "";

  return {
    ...parsedResponse,
    resume: {
      ...resume,
      name: mergedName,
      contact: mergedContact,
    },
  };
};

const normalizeAtsModelResponse = (modelOutput) => {
  const parsed = parseModelJson(modelOutput);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid ATS resume response format from AI.");
  }

  if ("resume" in parsed || "atsReport" in parsed) {
    return parsed;
  }

  return {
    resume: parsed,
    atsReport: {
      score: 0,
      keywordsMatched: [],
      improvements: [],
    },
  };
};

// ─── Zod schemas ───────────────────────────────────────────────────────────
const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Score between 0 to 100 indicating how well the candidate's resume and self-description align with the job description.",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The technical question that can be asked during the interview.",
          ),
        intention: z
          .string()
          .describe(
            "The intention of the interviewer behind asking this question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take.",
          ),
      }),
    )
    .min(5)
    .describe(
      "Technical questions to assess the candidate's knowledge and skills.",
    ),

  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The behavioral question that can be asked during the interview.",
          ),
        intention: z
          .string()
          .describe(
            "The intention of the interviewer behind asking this question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take.",
          ),
      }),
    )
    .min(4)
    .describe(
      "Behavioral questions to assess past experiences and soft skills.",
    ),

  skillsGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe("The skill which is missing in the candidate."),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("How critical this skill gap is for the role."),
      }),
    )
    .describe("Skills the candidate is missing for this job role."),

  preparationPlan: z
    .array(
      z.object({
        day: z.number().describe("The day number for the preparation plan."),
        focus: z.string().describe("The main focus or objective for that day."),
        tasks: z
          .array(
            z.object({
              task: z
                .string()
                .describe("The specific task to be completed on that day."),
              type: z.string().describe("The type or category of the task."),
            }),
          )
          .describe("Specific tasks for that day."),
      }),
    )
    .describe("Structured day-by-day preparation plan for the interview."),
});

const atsResumeSchema = z.object({
  resume: z.object({
    name: z.string().describe("Candidate's full name."),
    contact: z.object({
      email: z.string().describe("Candidate email address."),
      phone: z.string().describe("Candidate phone number."),
      location: z.string().describe("Candidate location."),
      linkedin: z
        .string()
        .optional()
        .describe("Candidate LinkedIn or professional URL."),
    }),
    summary: z.string().describe("ATS-optimized professional summary."),
    experience: z
      .array(
        z.object({
          title: z.string().describe("Job title."),
          company: z.string().describe("Employer name."),
          period: z.string().describe("Employment dates."),
          bullets: z
            .array(z.string())
            .describe("Key accomplishments and responsibilities."),
        }),
      )
      .describe("Work experience entries."),
    skills: z.object({
      technical: z.array(z.string()).describe("Technical skills."),
      soft: z.array(z.string()).describe("Soft skills."),
    }),
    education: z
      .array(
        z.object({
          degree: z.string().describe("Degree or certification."),
          school: z.string().describe("School or institution."),
          year: z.string().describe("Year completed."),
        }),
      )
      .describe("Education entries."),
  }),
  atsReport: z.object({
    score: z
      .number()
      .min(0)
      .max(100)
      .describe("Estimated ATS compatibility score."),
    keywordsMatched: z
      .array(z.string())
      .describe("Keywords matched from the job description."),
    improvements: z.array(z.string()).describe("Top resume improvements made."),
  }),
});

// ─── Prompts ───────────────────────────────────────────────────────────────
const buildInterviewReportPrompt = (
  resume,
  jobDescription,
  selfDescription,
) => `
You are an expert career coach and interview preparation specialist.

Analyze the following candidate information and job description, then generate a detailed interview preparation report.

## CANDIDATE RESUME:
${resume}

## JOB DESCRIPTION:
${jobDescription}

## CANDIDATE SELF DESCRIPTION:
${selfDescription}

## YOUR TASK:
Return a JSON object with the following:

1. matchScore: Score 0-100 of how well the candidate matches the job
2. technicalQuestions: 5-7 technical questions likely to be asked, with intention and how to answer
3. behavioralQuestions: 4-5 behavioral questions likely to be asked, with intention and how to answer
4. skillsGaps: List skills missing from the candidate's profile compared to job requirements, with severity
5. preparationPlan: A 7-day preparation plan with daily focus and tasks

Be specific to this candidate's actual resume and this exact job description.
Do NOT generate generic questions — tailor everything to the candidate's background.
Return at least 5 technical questions and at least 4 behavioral questions.
Return only valid JSON, no extra text.
`;

// Used when the candidate HAS uploaded an existing resume — we optimize it.
const buildATSResumeOptimizePrompt = (
  resume,
  jobDescription,
  selfDescription,
) => `
You are an expert ATS resume optimizer with 10+ years of experience in HR and recruitment.

## CANDIDATE RESUME:
${resume}

## JOB DESCRIPTION:
${jobDescription}

## SELF DESCRIPTION:
${selfDescription}

Generate a JSON object with the following shape:
{
  "resume": {
    "name": "...",
    "contact": {
      "email": "...",
      "phone": "...",
      "location": "...",
      "linkedin": "..."
    },
    "summary": "...",
    "experience": [
      {
        "title": "...",
        "company": "...",
        "period": "...",
        "bullets": ["...", "..."]
      }
    ],
    "skills": {
      "technical": ["..."],
      "soft": ["..."]
    },
    "education": [
      {"degree": "...", "school": "...", "year": "..."}
    ]
  },
  "atsReport": {
    "score": 0,
    "keywordsMatched": ["..."],
    "improvements": ["...", "..."]
  }
}

RULES:
- Keep the professional summary CONCISE — 2 to 3 sentences maximum. Do not write a long narrative; state role, core stack, and top strength only.
- For independent/personal projects (not real employers), format the experience "title" field as "{Role} (Independent Project)" and put the project's actual name in the "company" field (e.g., title: "Full Stack Developer (Independent Project)", company: "Scatch E-commerce Platform"), so the project name is always visible in the output.
- If the period for a project is not a real employment date range, use "Self-Directed" instead of inventing dates.
- Use exact keywords from the job description naturally.
- Preserve the candidate's real contact information from the resume exactly as provided.
- If contact information appears in the resume, use that exact name, email, phone, location, and LinkedIn without inventing or changing it.
- If you cannot uniquely extract a contact field, set it to an empty string rather than inventing any value.
- Do NOT invent or replace name, email, phone, location, or LinkedIn profile.
- Do NOT use placeholder names or generic example contact details in the final output.
- No tables, columns, graphics, or special characters.
- Do NOT fabricate skills, experience, or projects.
- Only enhance and reframe existing content.
- Provide valid JSON only, with no extra text or markdown.
`;

// Used when there is NO uploaded resume — build one fresh from Self Description + JD.
const buildATSResumeFromSelfDescriptionPrompt = (
  jobDescription,
  selfDescription,
) => `
You are an expert resume writer and ATS optimization specialist with 10+ years of experience in HR and recruitment.

The candidate has NOT uploaded an existing resume. Build a brand-new, ATS-optimized resume using ONLY the information the candidate has provided about themselves below, tailored toward the target job description.

## JOB DESCRIPTION:
${jobDescription}

## CANDIDATE SELF DESCRIPTION (name, skills, experience, education, etc.):
${selfDescription}

Generate a JSON object with the following shape:
{
  "resume": {
    "name": "...",
    "contact": {
      "email": "...",
      "phone": "...",
      "location": "...",
      "linkedin": "..."
    },
    "summary": "...",
    "experience": [
      {
        "title": "...",
        "company": "...",
        "period": "...",
        "bullets": ["...", "..."]
      }
    ],
    "skills": {
      "technical": ["..."],
      "soft": ["..."]
    },
    "education": [
      {"degree": "...", "school": "...", "year": "..."}
    ]
  },
  "atsReport": {
    "score": 0,
    "keywordsMatched": ["..."],
    "improvements": ["...", "..."]
  }
}

RULES:
- Keep the professional summary CONCISE — 2 to 3 sentences maximum. Do not write a long narrative; state role, core stack, and top strength only.
- For independent/personal projects mentioned in the Self Description (not real employers), format the "title" field as "{Role} (Independent Project)" and put the actual project name in the "company" field (e.g., title: "Full Stack Developer (Independent Project)", company: "Scatch E-commerce Platform"), so the project name is always visible in the output.
- If the period for a project is not a real employment date range, use "Self-Directed" instead of inventing dates.
- Build the resume STRICTLY from facts present in the Self Description. Do NOT invent employers, job titles, dates, degrees, or projects that were not mentioned.
- If a contact field (email, phone, location, linkedin) is not present in the Self Description, set it to an empty string rather than inventing one.
- Naturally incorporate exact keywords from the job description wherever they are truthfully supported by the candidate's real background.
- If the candidate has no formal work experience, it is fine to return an empty "experience" array or use relevant academic/personal projects if mentioned in the Self Description — do not fabricate employers.
- No tables, columns, graphics, or special characters.
- Provide valid JSON only, with no extra text or markdown.
`;

// ─── Shared input validation ───────────────────────────────────────────────
const requireNonEmptyString = (value, fieldName) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(
      `"${fieldName}" is required and must be a non-empty string.`,
    );
  }
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

// ─── Shared model-call-with-fallback runner ────────────────────────────────
const callGeminiWithFallback = async ({ contents, geminiSchema, label }) => {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is not set in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let lastError;

  for (const model of MODELS) {
    try {
      console.log(`[${label}] Trying model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: geminiSchema,
        },
      });

      const text = response?.text;
      if (!text) {
        throw new Error(`Empty response from ${model}.`);
      }

      console.log(`[${label}] Generated successfully with ${model}`);
      return text;
    } catch (error) {
      lastError = error;
      if (RETRYABLE_STATUS_CODES.has(error?.status)) {
        console.log(
          `[${label}] ${model} unavailable (status ${error.status}), trying next...`,
        );
        continue;
      }
      console.error(`[${label}] Gemini error:`, error?.message || error);
      throw error;
    }
  }

  throw new Error(
    `All Gemini models are currently unavailable for ${label}. Last error: ${lastError?.message || "unknown"}`,
  );
};

// ─── Helper: convert a generated resume object into plain text ────────────
// Needed so the structured resume produced by generateATSResume can be fed
// into generateInterviewReport, which expects a resume as plain text.
const resumeObjectToText = (resume) => {
  if (!resume || typeof resume !== "object") return "";

  const lines = [];
  lines.push(resume.name || "");
  const contact = resume.contact || {};
  lines.push(
    [contact.email, contact.phone, contact.location, contact.linkedin]
      .filter(Boolean)
      .join(" | "),
  );
  lines.push("");
  if (resume.summary) {
    lines.push("SUMMARY");
    lines.push(resume.summary);
    lines.push("");
  }

  if (Array.isArray(resume.experience) && resume.experience.length) {
    lines.push("EXPERIENCE");
    for (const exp of resume.experience) {
      lines.push(
        `${exp.title || ""} — ${exp.company || ""} (${exp.period || ""})`,
      );
      for (const bullet of exp.bullets || []) {
        lines.push(`- ${bullet}`);
      }
    }
    lines.push("");
  }

  if (resume.skills) {
    lines.push("SKILLS");
    if (resume.skills.technical?.length) {
      lines.push(`Technical: ${resume.skills.technical.join(", ")}`);
    }
    if (resume.skills.soft?.length) {
      lines.push(`Soft: ${resume.skills.soft.join(", ")}`);
    }
    lines.push("");
  }

  if (Array.isArray(resume.education) && resume.education.length) {
    lines.push("EDUCATION");
    for (const edu of resume.education) {
      lines.push(
        `${edu.degree || ""} — ${edu.school || ""} (${edu.year || ""})`,
      );
    }
  }

  return lines.join("\n");
};

// ─── Public API ──────────────────────────────────────────────────────────────

// Standalone Analyze flow — used when the candidate uploads their OWN resume.
// Mandatory: resume, jobDescription, selfDescription.
const generateInterviewReport = async ({
  jobDescription,
  resume,
  selfDescription,
}) => {
  requireNonEmptyString(resume, "resume");
  requireNonEmptyString(jobDescription, "jobDescription");
  requireNonEmptyString(selfDescription, "selfDescription");

  const rawText = await callGeminiWithFallback({
    contents: buildInterviewReportPrompt(
      resume,
      jobDescription,
      selfDescription,
    ),
    geminiSchema: toGeminiSchema(interviewReportSchema),
    label: "interview-report",
  });

  const parsed = parseModelJson(rawText);
  const result = interviewReportSchema.safeParse(parsed);

  if (!result.success) {
    console.error(
      "Interview report failed schema validation:",
      result.error.flatten(),
    );
    throw new Error(
      "AI returned an interview report that did not match the expected schema.",
    );
  }

  return result.data;
};

// Generate Resume flow — resume upload is now OPTIONAL.
// Mandatory: jobDescription, selfDescription.
// If `resume` is omitted/empty, a fresh resume is built from selfDescription instead.
async function generateATSResume({ jobDescription, resume, selfDescription }) {
  requireNonEmptyString(jobDescription, "jobDescription");
  requireNonEmptyString(selfDescription, "selfDescription");

  const hasResume = isNonEmptyString(resume);

  const rawText = await callGeminiWithFallback({
    contents: hasResume
      ? buildATSResumeOptimizePrompt(resume, jobDescription, selfDescription)
      : buildATSResumeFromSelfDescriptionPrompt(
          jobDescription,
          selfDescription,
        ),
    geminiSchema: toGeminiSchema(atsResumeSchema),
    label: hasResume ? "ats-resume-optimize" : "ats-resume-generate",
  });

  const normalized = normalizeAtsModelResponse(rawText);
  const withContact = hasResume
    ? fillResumeContactFallback(normalized, resume)
    : normalized;

  const result = atsResumeSchema.safeParse(withContact);
  if (!result.success) {
    console.error(
      "ATS resume failed schema validation:",
      result.error.flatten(),
    );
    throw new Error(
      "AI returned an ATS resume that did not match the expected schema.",
    );
  }

  return result.data;
}

// Chained flow: Generate Resume → auto Analyze.
// Mandatory: jobDescription, selfDescription. Resume is optional (same rule as generateATSResume).
// After generating the resume, it is immediately run through generateInterviewReport
// using the generated resume text + the same jobDescription + selfDescription.
async function generateResumeAndAnalyze({
  jobDescription,
  resume,
  selfDescription,
}) {
  requireNonEmptyString(jobDescription, "jobDescription");
  requireNonEmptyString(selfDescription, "selfDescription");

  const atsResult = await generateATSResume({
    jobDescription,
    resume,
    selfDescription,
  });

  const generatedResumeText = resumeObjectToText(atsResult.resume);

  let interviewReport = null;
  let analysisError = null;
  try {
    interviewReport = await generateInterviewReport({
      jobDescription,
      resume: generatedResumeText,
      selfDescription,
    });
  } catch (error) {
    console.error(
      "Auto-analyze after resume generation failed:",
      error?.message || error,
    );
    analysisError =
      error?.message || "Analysis failed after resume generation.";
  }

  return {
    generatedResume: atsResult.resume,
    atsReport: atsResult.atsReport,
    interviewReport,
    analysisError,
  };
}

export { generateInterviewReport, generateATSResume, generateResumeAndAnalyze };
