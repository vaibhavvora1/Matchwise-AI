import { useState } from "react";
import api from "../../../services/httpClient";

const JobMatch = () => {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [criteria, setCriteria] = useState(null);
  const [jobs, setJobs] = useState([]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reuses your existing resume-parsing endpoint (pdf-parse v2 based)
    const formData = new FormData();
    formData.append("resume", file);

    try {
      setError("");
      const { data } = await api.post("/resume/extract-text", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeText(data.text || "");
    } catch (err) {
      setError("Couldn't read that resume file. Try pasting the text instead.");
      err.message = "";
    }
  };

  const handleFindJobs = async () => {
    if (!resumeText || resumeText.trim().length < 50) {
      setError("Add resume content first (upload or paste, at least a few lines).");
      return;
    }

    setLoading(true);
    setError("");
    setJobs([]);
    setCriteria(null);

    try {
      const { data } = await api.post("/jobs/match", { resumeText });
      setCriteria(data.criteria);
      setJobs(data.jobs);
    } catch (err) {
      setError(err.response?.data?.message || "Job matching failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-[Cormorant_Garamond] text-4xl md:text-5xl text-amber-300 mb-2">
          Find Matching Roles
        </h1>
        <p className="font-[DM_Sans] text-neutral-400 mb-10">
          Upload your resume and we'll surface relevant openings across India.
        </p>

        <div className="border border-amber-500/20 rounded-xl p-6 bg-neutral-950 mb-6">
          <label className="block font-[DM_Sans] text-sm text-amber-200 mb-3">
            Upload Resume (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0 file:bg-amber-500/10 file:text-amber-300
                       hover:file:bg-amber-500/20 file:font-[DM_Sans] cursor-pointer"
          />

          <div className="my-4 text-center text-neutral-600 text-xs font-[DM_Sans]">
            — or paste resume text —
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={6}
            placeholder="Paste your resume content here..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3
                       text-sm text-neutral-200 font-[DM_Sans] focus:outline-none
                       focus:border-amber-500/50 resize-none"
          />

          <button
            onClick={handleFindJobs}
            disabled={loading}
            className="mt-4 w-full py-3 rounded-lg bg-amber-500 text-black font-[DM_Sans]
                       font-medium hover:bg-amber-400 transition disabled:opacity-50"
          >
            {loading ? "Analyzing resume..." : "Find Matching Jobs"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400 font-[DM_Sans]">{error}</p>
          )}
        </div>

        {criteria && (
          <div className="mb-6 text-sm font-[DM_Sans] text-neutral-400">
            Matched on <span className="text-amber-300">{criteria.jobTitle}</span>
            {" · "}
            {criteria.skills?.join(", ")}
          </div>
        )}

        <div className="space-y-4">
          {jobs.map((job, i) => (
            <a
              key={job.job_id || i}
              href={job.job_apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-neutral-800 rounded-xl p-5 bg-neutral-950
                         hover:border-amber-500/40 transition">

              <h3 className="font-[Cormorant_Garamond] text-xl text-amber-200">
                {job.job_title}
              </h3>
              <p className="font-[DM_Sans] text-sm text-neutral-400 mt-1">
                {job.employer_name} · {job.job_city || "India"}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobMatch;