import { z } from "zod";

// Used on POST /api/ai/ats-resume (Generate Resume flow)
// Resume upload is optional — only JD + SD are required in the body.
export const generateResumeSchema = z.object({
  jobDescription: z.string().trim().min(1, "Job description is required."),
  selfDescription: z.string().trim().min(1, "Self description is required."),
  resume: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
});

// Used on POST /api/ai/interview-report (Analyze flow)
// Resume is mandatory here — either as an uploaded file (multer) or as body.resume text.
// Since multer parses the file separately from the JSON/body fields, this schema only
// enforces JD + SD; the controller still checks for the uploaded/text resume itself.
export const analyzeResumeSchema = z.object({
  jobDescription: z.string().trim().min(1, "Job description is required."),
  selfDescription: z.string().trim().min(1, "Self description is required."),
  resume: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
});
