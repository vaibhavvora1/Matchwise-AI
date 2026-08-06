import { createContext, useState } from 'react'

const AIContext = createContext(null)

export const AIContextProvider = ({ children }) => {
  const [atsResumeData, setAtsResumeData] = useState(null)
  const [interviewReportData, setInterviewReportData] = useState(null)
  const [isLoadingResume, setIsLoadingResume] = useState(false)
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [lastInputs, setLastInputs] = useState(null) // { resumeFile, jobDescription, selfDescription }

  // ─── Matching Jobs (JSearch) ───
  // Populated by a background call kicked off right after resume generation.
  const [jobMatches, setJobMatches] = useState(null)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [jobsWarning, setJobsWarning] = useState('')

  return (
    <AIContext.Provider
      value={{
        atsResumeData, setAtsResumeData,
        interviewReportData, setInterviewReportData,
        isLoadingResume, setIsLoadingResume,
        isLoadingReport, setIsLoadingReport,
        lastInputs, setLastInputs,
        jobMatches, setJobMatches,
        isLoadingJobs, setIsLoadingJobs,
        jobsWarning, setJobsWarning,
      }}
    >
      {children}
    </AIContext.Provider>
  )
}

export default AIContext