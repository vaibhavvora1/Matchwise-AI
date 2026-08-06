import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import useAI from '../../../context/useAI'
import { generateATSResume, generateInterviewReport } from '../../../services/ai.api'
import { getMatchingJobs } from '../../../services/jobs.api'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import PageTransition from '../../../components/ui/PageTransition'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'

/* ─── Converts a generated resume object into plain text ───
   Needed to send the generated resume into the Analyze API as a text
   body field (no file) for the background analysis call. */
const resumeObjectToText = (resume) => {
  if (!resume || typeof resume !== 'object') return ''
  const lines = []
  lines.push(resume.name || '')
  const contact = resume.contact || {}
  lines.push([contact.email, contact.phone, contact.location, contact.linkedin].filter(Boolean).join(' | '))
  lines.push('')
  if (resume.summary) {
    lines.push('SUMMARY')
    lines.push(resume.summary)
    lines.push('')
  }
  if (Array.isArray(resume.experience) && resume.experience.length) {
    lines.push('EXPERIENCE')
    resume.experience.forEach((exp) => {
      lines.push(`${exp.title || ''} — ${exp.company || ''} (${exp.period || ''})`)
      ;(exp.bullets || []).forEach((b) => lines.push(`- ${b}`))
    })
    lines.push('')
  }
  if (resume.skills) {
    lines.push('SKILLS')
    if (resume.skills.technical?.length) lines.push(`Technical: ${resume.skills.technical.join(', ')}`)
    if (resume.skills.soft?.length) lines.push(`Soft: ${resume.skills.soft.join(', ')}`)
    lines.push('')
  }
  if (Array.isArray(resume.education) && resume.education.length) {
    lines.push('EDUCATION')
    resume.education.forEach((edu) => lines.push(`${edu.degree || ''} — ${edu.school || ''} (${edu.year || ''})`))
  }
  return lines.join('\n')
}

/* ─── Character counter ─── */
const CharCounter = ({ current, max }) => (
  <span style={{
    fontSize: '0.75rem',
    color: current > max * 0.9 ? 'var(--color-warning)' : 'var(--color-text-muted)',
    fontVariantNumeric: 'tabular-nums',
  }}>
    {current} / {max}
  </span>
)

/* ─── Column Header ─── */
const ColHeader = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
      <div style={{
        width: '32px', height: '32px',
        background: 'var(--color-indigo-50)',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-highlight)',
      }}>
        {icon}
      </div>
      <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{title}</h2>
    </div>
    {subtitle && (
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginLeft: '42px' }}>{subtitle}</p>
    )}
  </div>
)

const Analyze = () => {
  const navigate = useNavigate()
  const {
    setAtsResumeData, setInterviewReportData,
    setIsLoadingResume, setIsLoadingReport,
    isLoadingResume, isLoadingReport,
    setLastInputs,
    setJobMatches, setIsLoadingJobs, setJobsWarning,
  } = useAI()

  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [selfDescription, setSelfDescription] = useState('')
  const [error, setError] = useState('')

  const JD_MAX = 5000
  const SD_MAX = 5000

  // ─── Dropzone ───
  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setResumeFile(accepted[0])
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: () => setError('Only PDF files up to 10MB are accepted.'),
  })

  const removeFile = (e) => {
    e.stopPropagation()
    setResumeFile(null)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ─── Validation ───
  // Generate Resume: resume is OPTIONAL — only JD + SD are required.
  const validateForResumeGeneration = () => {
    if (!jobDescription.trim()) return 'Please paste the job description.'
    if (!selfDescription.trim()) return 'Please write your self description.'
    return ''
  }

  // Interview Report (Analyze): resume + JD + SD are all required — unchanged.
  const validateForInterviewReport = () => {
    if (!resumeFile) return 'Please upload your resume PDF.'
    if (!jobDescription.trim()) return 'Please paste the job description.'
    if (!selfDescription.trim()) return 'Please write your self description.'
    return ''
  }

  // ─── Generate ATS Resume (resume optional) ───
  // Navigates to the result page as soon as the resume is ready — does NOT
  // wait for analysis. Analysis is kicked off separately, in the background,
  // so the user can start reading their resume immediately.
  const handleGenerateResume = async () => {
    const err = validateForResumeGeneration()
    if (err) { setError(err); return }
    setError('')
    setLastInputs({ resumeFile, jobDescription, selfDescription })
    setInterviewReportData(null)
    setIsLoadingResume(true)
    try {
      const data = await generateATSResume(resumeFile, jobDescription, selfDescription)
      setAtsResumeData(data)
      navigate('/resume-result')

      // Fire-and-forget: generate the interview analysis in the background
      // using the resume that was just generated (converted to text) plus
      // the same JD/SD. The Resume Result page reads isLoadingReport /
      // interviewReportData from context to enable its "Check Analysis" button.
      const generatedResumeObj = data?.optimizedResume?.resume || data?.resume
      const resumeText = resumeFile ? null : resumeObjectToText(generatedResumeObj)

      setIsLoadingReport(true)
      generateInterviewReport(
        resumeFile || resumeText,
        jobDescription,
        selfDescription,
      )
        .then((reportData) => {
          setInterviewReportData(reportData)
        })
        .catch((e) => {
          console.warn('Background analysis failed:', e?.response?.data?.message || e)
          setInterviewReportData(null)
        })
        .finally(() => {
          setIsLoadingReport(false)
        })

      // Fire-and-forget: search for matching job vacancies in the background,
      // using the generated resume's text. The backend extracts skills/title
      // itself. The Resume Result page reads jobMatches/isLoadingJobs from
      // context to render the "Matching Jobs" card without blocking the UI.
      setJobMatches(null)
      setJobsWarning('')
      setIsLoadingJobs(true)

      getMatchingJobs(resumeObjectToText(generatedResumeObj))
        .then(({ jobs, warning }) => {
          setJobMatches(jobs)
          setJobsWarning(warning || '')
        })
        .catch((e) => {
          console.warn('Background job search failed:', e?.response?.data?.message || e)
          setJobMatches([])
          setJobsWarning(e?.response?.data?.message || 'Job search is temporarily unavailable.')
        })
        .finally(() => {
          setIsLoadingJobs(false)
        })
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to generate resume. Please try again.')
    } finally {
      setIsLoadingResume(false)
    }
  }

  // ─── Generate Interview Report (resume required) ───
  const handleGenerateReport = async () => {
    const err = validateForInterviewReport()
    if (err) { setError(err); return }
    setError('')
    setLastInputs({ resumeFile, jobDescription, selfDescription })
    setIsLoadingReport(true)
    try {
      const data = await generateInterviewReport(resumeFile, jobDescription, selfDescription)
      setInterviewReportData(data)
      navigate('/interview-report')
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to generate report. Please try again.')
    } finally {
      setIsLoadingReport(false)
    }
  }

  const isLoading = isLoadingResume || isLoadingReport

  return (
    <PageTransition>
      <Navbar />

      <div style={{ paddingTop: '72px', minHeight: '100vh' }}>
        {/* Page Header */}
        <div style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '40px 0',
        }}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="section-label" style={{ marginBottom: '8px' }}>Step 1 of 1</p>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Analyze Your Profile
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
                Paste the job description and tell us about yourself. Uploading a resume is optional when generating a new one — but required for the Interview Report.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 24px 80px' }}>
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#B91C1C',
                  fontSize: '0.9rem',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3-Column Grid */}
          <div className="analyze-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '32px',
          }}>

            {/* ─── Left: Resume Upload ─── */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <ColHeader
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                title="Resume Upload"
                subtitle="PDF only, max 10MB — optional for Generate Resume, required for Interview Report"
              />

              <AnimatePresence mode="wait">
                {!resumeFile ? (
                  <motion.div
                    key="dropzone"
                    {...getRootProps()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      border: `2px dashed ${isDragActive ? 'var(--color-highlight)' : isDragReject ? 'var(--color-error)' : 'var(--color-border)'}`,
                      borderRadius: '12px',
                      padding: '40px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragActive ? 'var(--color-indigo-50)' : 'transparent',
                      transition: 'all 0.25s',
                      outline: 'none',
                      animation: isDragActive ? 'dropzone-pulse 1s infinite' : 'none',
                    }}
                  >
                    <input {...getInputProps()} id="resume-upload-input" />
                    <motion.div
                      animate={isDragActive ? { scale: 1.15 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{
                        width: '52px', height: '52px',
                        background: isDragActive ? 'var(--color-indigo-100)' : '#F4F4F5',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: isDragActive ? 'var(--color-highlight)' : 'var(--color-secondary)',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                    <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px', fontSize: '0.9375rem' }}>
                      {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume (optional)'}
                    </p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginBottom: '16px' }}>
                      or click to browse files
                    </p>
                    <span className="badge badge-neutral">PDF · Optional</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file-preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      border: '1.5px solid var(--color-success)',
                      background: '#F0FDF4',
                      borderRadius: '12px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px',
                        background: '#DCFCE7',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        color: 'var(--color-success)',
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {resumeFile.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {formatSize(resumeFile.size)}
                        </p>
                      </div>
                      <button
                        onClick={removeFile}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--color-text-muted)', padding: '4px', borderRadius: '6px',
                          transition: 'color 0.2s',
                          flexShrink: 0,
                        }}
                        title="Remove file"
                        id="remove-resume-btn"
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    <button
                      {...getRootProps()}
                      onClick={e => e.stopPropagation()}
                      style={{
                        marginTop: '14px',
                        width: '100%',
                        background: 'none',
                        border: '1px solid #BBF7D0',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        color: '#15803D',
                        fontWeight: 500,
                        transition: 'background 0.2s',
                      }}
                      id="replace-resume-btn"
                    >
                      <input {...getInputProps()} />
                      Replace file
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <style>{`
                @keyframes dropzone-pulse {
                  0%, 100% { border-color: var(--color-highlight); }
                  50% { border-color: #818CF8; }
                }
              `}</style>
            </motion.div>

            {/* ─── Center: Job Description ─── */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <ColHeader
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                title="Job Description"
                subtitle="Paste the complete job posting — required"
              />
              <div style={{ position: 'relative' }}>
                <textarea
                  id="job-description-input"
                  className="textarea"
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value.slice(0, JD_MAX))}
                  placeholder="Paste the full job description here...&#10;&#10;Include requirements, responsibilities, and preferred qualifications for best results."
                  style={{ minHeight: '320px', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <CharCounter current={jobDescription.length} max={JD_MAX} />
              </div>
            </motion.div>

            {/* ─── Right: Self Description ─── */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ColHeader
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                title="Self Description"
                subtitle="Tell us what makes you unique — required"
              />
              <textarea
                id="self-description-input"
                className="textarea"
                value={selfDescription}
                onChange={e => setSelfDescription(e.target.value.slice(0, SD_MAX))}
                placeholder="Describe yourself, your strengths, goals, and what makes you unique...&#10;&#10;Example: I am a full-stack developer with 3 years of experience in React and Node.js, passionate about building scalable products..."
                style={{ minHeight: '320px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <CharCounter current={selfDescription.length} max={SD_MAX} />
              </div>
            </motion.div>
          </div>

          {/* ─── Action Buttons ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="analyze-actions"
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <motion.button
              id="generate-ats-resume-btn"
              onClick={handleGenerateResume}
              disabled={isLoading}
              className={`btn btn-lg ${isLoadingResume ? 'btn-loading' : 'btn-indigo'}`}
              whileHover={!isLoading ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isLoading ? { scale: 0.97 } : {}}
              style={{ minWidth: '240px' }}
            >
              {isLoadingResume ? (
                <>
                  <LoadingSpinner size={18} color="white" />
                  Generating Resume...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Generate ATS Resume
                </>
              )}
            </motion.button>

            <motion.button
              id="generate-interview-report-btn"
              onClick={handleGenerateReport}
              disabled={isLoading}
              className={`btn btn-lg ${isLoadingReport ? 'btn-loading' : 'btn-primary'}`}
              whileHover={!isLoading ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isLoading ? { scale: 0.97 } : {}}
              style={{ minWidth: '240px' }}
            >
              {isLoadingReport ? (
                <>
                  <LoadingSpinner size={18} color="white" />
                  Generating Report...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Generate Interview Report
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Hint */}
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '16px' }}>
            AI analysis typically takes 15–30 seconds. Please keep this tab open.
          </p>
        </div>
      </div>

      <style>{`
        /* Collapse the 3-column layout into a single column at tablet/mobile widths */
        @media (max-width: 1024px) {
          .analyze-grid { grid-template-columns: 1fr !important; }
        }

        /* Tighter spacing and full-width CTA buttons on phones */
        @media (max-width: 640px) {
          .analyze-grid { gap: 16px !important; }
          .analyze-grid .card { padding: 16px !important; }
          .analyze-actions .btn { min-width: 100% !important; width: 100% !important; }
          .analyze-actions { padding-inline: 6px; }
          textarea.textarea { min-height: 220px !important; }
        }

        /* Ensure action buttons are comfortably tappable on small-mid phones */
        @media (max-width: 428px) {
          .analyze-actions .btn { padding: 14px 16px !important; font-size: 1rem !important; }
        }
      `}</style>

      <Footer />
    </PageTransition>
  )
}

export default Analyze