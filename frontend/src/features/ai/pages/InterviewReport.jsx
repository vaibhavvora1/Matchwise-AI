import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useAI from '../../../context/useAI'
import { generateATSResume } from '../../../services/ai.api'
import { useGSAPCounter } from '../../../hooks/useGSAPReveal'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import PageTransition from '../../../components/ui/PageTransition'
import { InterviewReportSkeleton } from '../../../components/ui/SkeletonLoader'
import TabBar from '../components/TabBar'
import AccordionItem from '../components/AccordionItem'
import SkillGapCard from '../components/SkillGapCard'
import DayCard from '../components/DayCard'

/* ─── Mock data — field names match Zod schema ─── */
const MOCK_DATA = {
  matchScore: 78,
  summary: 'Your profile strongly aligns with the role. A few targeted improvements will make you an outstanding candidate.',
  technicalQuestions: [
    {
      question: 'Explain the difference between useMemo and useCallback in React.',
      intention: 'Tests depth of React optimization knowledge.',
      answer: 'Explain that useMemo memoizes a computed value, while useCallback memoizes a function reference. Give a concrete example where misuse causes unnecessary re-renders.',
    },
    {
      question: 'How would you design a scalable REST API for a high-traffic application?',
      intention: 'Assesses system design thinking and knowledge of caching.',
      answer: 'Cover: stateless endpoints, horizontal scaling, in-memory/CDN caching, database indexing, rate limiting, CDN for static assets.',
    },
    {
      question: 'How do you approach database query optimization?',
      intention: 'Tests practical knowledge of database performance.',
      answer: 'Mention EXPLAIN ANALYZE, index strategies, N+1 query problem, connection pooling, and query caching.',
    },
    {
      question: 'What is your experience with JWT authentication?',
      intention: 'Evaluates auth implementation knowledge.',
      answer: 'Discuss token structure, signing, HTTP-only cookies, refresh token rotation, and RBAC patterns.',
    },
    {
      question: 'How does the Node.js event loop work?',
      intention: 'Tests core Node.js understanding.',
      answer: 'Explain call stack, event queue, microtask queue, libuv, and how async I/O is handled without blocking.',
    },
  ],
  behavioralQuestions: [
    {
      question: 'Tell me about a time you led a project under a tight deadline.',
      intention: 'Assesses leadership, prioritization, and pressure management.',
      answer: 'Use the STAR method. Focus on how you broke down the problem, delegated tasks, communicated with stakeholders, and delivered on time.',
    },
    {
      question: 'Describe a situation where you disagreed with a technical decision.',
      intention: 'Tests collaborative problem-solving and communication skills.',
      answer: 'Show that you voiced concerns constructively, presented data/evidence, listened to others perspective, and committed to the team decision.',
    },
    {
      question: 'How do you handle receiving critical feedback on your work?',
      intention: 'Evaluates growth mindset and emotional intelligence.',
      answer: 'Show openness to feedback, give a specific example where feedback improved your work, and describe what you changed going forward.',
    },
    {
      question: 'Give an example of when you proactively solved a problem before it escalated.',
      intention: 'Tests initiative and proactive thinking.',
      answer: 'Describe a bug/risk you spotted, how you assessed the impact, steps you took without being asked, and the positive outcome.',
    },
  ],
  skillsGaps: [
    { skill: 'Kubernetes', severity: 'high', description: 'The role requires hands-on K8s cluster management experience.' },
    { skill: 'GraphQL', severity: 'medium', description: 'GraphQL is listed as preferred. Your resume shows REST expertise only.' },
    { skill: 'System Design', severity: 'medium', description: 'Add concrete system design examples to demonstrate scalability thinking.' },
    { skill: 'CI/CD Pipelines', severity: 'low', description: 'Adding GitHub Actions or Jenkins experience would strengthen your profile.' },
    { skill: 'TypeScript', severity: 'low', description: 'Brush up on advanced TypeScript generics and utility types.' },
    { skill: 'Terraform / IaC', severity: 'high', description: 'Infrastructure as Code is a hard requirement in the job description.' },
  ],
  preparationPlan: [
    {
      day: 1,
      focus: 'Resume & Profile Polish',
      tasks: [
        { task: 'Review and finalize your ATS-optimized resume', type: 'preparation' },
        { task: 'Update LinkedIn to mirror your resume', type: 'preparation' },
        { task: 'Prepare a 2-minute elevator pitch', type: 'practice' },
      ],
    },
    {
      day: 2,
      focus: 'Core Technical Review',
      tasks: [
        { task: 'Revise Node.js event loop and async patterns', type: 'study' },
        { task: 'Practice 5 LeetCode medium problems (arrays & strings)', type: 'practice' },
        { task: 'Review JWT auth, bcrypt, and RBAC patterns', type: 'study' },
      ],
    },
    {
      day: 3,
      focus: 'System Design',
      tasks: [
        { task: 'Study distributed system fundamentals', type: 'study' },
        { task: 'Practice designing a URL shortener from scratch', type: 'practice' },
        { task: 'Learn about load balancers, CDNs, and caching strategies', type: 'study' },
      ],
    },
    {
      day: 4,
      focus: 'Skill Gap: Kubernetes & DevOps',
      tasks: [
        { task: 'Complete Kubernetes crash course (2 hours on YouTube)', type: 'study' },
        { task: 'Set up a local K8s cluster with Minikube', type: 'practice' },
        { task: 'Deploy a simple Node.js app to K8s', type: 'practice' },
      ],
    },
    {
      day: 5,
      focus: 'Behavioral Interview Prep',
      tasks: [
        { task: 'Write STAR stories for 8 key experiences', type: 'preparation' },
        { task: 'Practice mock behavioral interview with a friend', type: 'practice' },
        { task: 'Research the company culture, mission, and recent news', type: 'research' },
      ],
    },
    {
      day: 6,
      focus: 'Mock Interviews',
      tasks: [
        { task: 'Do 1 full mock technical interview (use Pramp or Interviewing.io)', type: 'practice' },
        { task: 'Record yourself answering behavioral questions', type: 'practice' },
        { task: 'Review and improve based on feedback', type: 'review' },
      ],
    },
    {
      day: 7,
      focus: 'Final Prep & Mindset',
      tasks: [
        { task: 'Light review of key concepts only', type: 'review' },
        { task: 'Prepare questions to ask the interviewer', type: 'preparation' },
        { task: 'Plan logistics: outfit, Zoom setup, rest well', type: 'preparation' },
      ],
    },
  ],
}

/* ─── Score color logic ─── */
const getScoreColor = (score) => {
  if (score >= 71) return { color: '#22C55E', bg: '#F0FDF4', label: 'Excellent Match', desc: 'You are a strong candidate for this role. Focus on polishing your answers and addressing minor skill gaps.' }
  if (score >= 41) return { color: '#F59E0B', bg: '#FFFBEB', label: 'Good Match', desc: 'Solid alignment with the role. Address the highlighted skill gaps and practice the suggested questions.' }
  return { color: '#EF4444', bg: '#FEF2F2', label: 'Needs Work', desc: 'Significant gaps detected. Use the 7-day plan to close gaps before applying.' }
}

const InterviewReport = () => {
  const navigate = useNavigate()
  const {
    interviewReportData, isLoadingReport,
    atsResumeData, setAtsResumeData,
    isLoadingResume, setIsLoadingResume,
    lastInputs,
    jobMatches, isLoadingJobs, jobsWarning,
  } = useAI()
  const [activeTab, setActiveTab] = useState(0)
  const [resumeError, setResumeError] = useState('')

  const data = interviewReportData || MOCK_DATA
  const technicalQuestions = Array.isArray(data.technicalQuestions) ? data.technicalQuestions : []
  const behavioralQuestions = Array.isArray(data.behavioralQuestions) ? data.behavioralQuestions : []
  const skillsGaps = Array.isArray(data.skillsGaps) ? data.skillsGaps : []
  const preparationPlan = Array.isArray(data.preparationPlan) ? data.preparationPlan : []
  const matchScore = typeof data.matchScore === 'number' ? data.matchScore : 0
  const scoreRef = useRef(null)
  const scoreColor = getScoreColor(matchScore)

  const hasJobMatches = Array.isArray(jobMatches) && jobMatches.length > 0

  useGSAPCounter(scoreRef, matchScore, { suffix: '%', duration: 1.8 })

  const TABS = [
    { label: 'Technical', count: technicalQuestions.length },
    { label: 'Behavioral', count: behavioralQuestions.length },
    { label: 'Skill Gaps', count: skillsGaps.length },
    { label: '7-Day Plan', count: preparationPlan.length },
  ]

  // ─── View / generate ATS resume on demand ───
  const handleViewResume = async () => {
    setResumeError('')

    if (atsResumeData) {
      navigate('/resume-result')
      return
    }

    if (!lastInputs || !lastInputs.resumeFile || !lastInputs.jobDescription || !lastInputs.selfDescription) {
      setResumeError('Original resume/job description data was lost. Please run analysis again.')
      return
    }

    setIsLoadingResume(true)
    try {
      const generated = await generateATSResume(
        lastInputs.resumeFile,
        lastInputs.jobDescription,
        lastInputs.selfDescription,
      )
      setAtsResumeData(generated)
      navigate('/resume-result')
    } catch (e) {
      setResumeError(e?.response?.data?.message || 'Failed to generate resume. Please try again.')
    } finally {
      setIsLoadingResume(false)
    }
  }

  const handleViewMatchingJobs = () => {
    navigate('/match-jobs')
  }

  if (isLoadingReport) {
    return (
      <PageTransition>
        <Navbar />
        <div style={{ paddingTop: '72px' }}>
          <div className="container" style={{ padding: '48px 24px' }}>
            <InterviewReportSkeleton />
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <Navbar />

      <div style={{ paddingTop: '72px', minHeight: '100vh' }}>
        {/* Page Header */}
        <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '40px 0' }}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
            >
              <div>
                <p className="section-label" style={{ marginBottom: '6px' }}>Result</p>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-text-primary)' }}>
                  Interview Preparation Report
                </h1>
              </div>
              <button onClick={() => navigate('/analyze')} className="btn btn-primary btn-sm" id="report-analyze-again-btn">
                Analyze Again
              </button>
            </motion.div>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 24px 80px' }}>

          {/* ─── Resume error banner ─── */}
          <AnimatePresence>
            {resumeError && (
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
                {resumeError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Match Score Section ─── */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '32px', background: scoreColor.bg, borderColor: `${scoreColor.color}30` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
              {/* Score display */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'center', marginBottom: '6px' }}>
                  <span
                    ref={scoreRef}
                    style={{
                      fontSize: 'clamp(3rem, 8vw, 5rem)',
                      fontWeight: 900,
                      color: scoreColor.color,
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                    }}
                  >
                    0%
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor.color }}>Match Score</p>
              </div>

              {/* Divider */}
              <div style={{ width: '1px', height: '80px', background: `${scoreColor.color}30`, flexShrink: 0 }} className="score-divider" />

              {/* Summary */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'white', borderRadius: '999px', padding: '4px 12px',
                    fontSize: '0.8125rem', fontWeight: 600, color: scoreColor.color,
                    border: `1px solid ${scoreColor.color}40`,
                  }}>
                    {data.matchScore >= 71 ? '🎯' : data.matchScore >= 41 ? '📊' : '⚠️'} {scoreColor.label}
                  </span>
                </div>
                <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  {data.summary || scoreColor.desc}
                </p>
                <div style={{ marginTop: '16px' }}>
                  <div className="progress-bar-track">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${data.matchScore}%` }}
                      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                      style={{ background: scoreColor.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Tabs ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <TabBar tabs={TABS} activeIndex={activeTab} onChange={setActiveTab} />

            <div style={{ padding: '28px' }}>
              <AnimatePresence mode="wait">

                {/* Tab 1: Technical Questions */}
                {activeTab === 0 && (
                  <motion.div
                    key="technical"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ marginBottom: '20px' }}>
                      <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        Technical Questions
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        Click any question to see the interviewer's intention and how to answer effectively.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {technicalQuestions.length > 0 ? technicalQuestions.map((item, i) => (
                        <AccordionItem
                          key={i}
                          index={i}
                          question={item.question}
                          intention={item.intention}
                          howToAnswer={item.answer}
                        />
                      )) : (
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                          No technical questions were generated. Please try again or check your resume and job description.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Tab 2: Behavioral Questions */}
                {activeTab === 1 && (
                  <motion.div
                    key="behavioral"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ marginBottom: '20px' }}>
                      <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        Behavioral Questions
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        Use the STAR method (Situation, Task, Action, Result) for all behavioral answers.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {behavioralQuestions.length > 0 ? behavioralQuestions.map((item, i) => (
                        <AccordionItem
                          key={i}
                          index={i}
                          question={item.question}
                          intention={item.intention}
                          howToAnswer={item.answer}
                        />
                      )) : (
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                          No behavioral questions were generated. Please try again or adjust your input.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Tab 3: Skill Gaps */}
                {activeTab === 2 && (
                  <motion.div
                    key="skills"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        Skill Gap Analysis
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        Skills identified as missing or weak relative to the job requirements.
                      </p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {[['High', 'badge-error'], ['Medium', 'badge-warning'], ['Low', 'badge-success']].map(([label, cls]) => (
                          <span key={label} className={`badge ${cls}`}>{label} Priority</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {skillsGaps.map((gap, i) => (
                        <SkillGapCard
                          key={i}
                          index={i}
                          skill={gap.skill}
                          severity={gap.severity}
                          description={gap.description}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Tab 4: 7-Day Prep Plan */}
                {activeTab === 3 && (
                  <motion.div
                    key="plan"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ marginBottom: '32px' }}>
                      <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        7-Day Interview Preparation Plan
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        A structured daily plan to maximize your interview readiness in one week.
                      </p>
                    </div>
                    <div style={{ maxWidth: '640px' }}>
                      {preparationPlan.map((day, i) => (
                        <DayCard
                          key={i}
                          index={i}
                          day={day.day}
                          focus={day.focus}
                          tasks={day.tasks.map(t => t.task)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>

          {/* ─── Bottom CTA ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              onClick={handleViewResume}
              className="btn btn-outline"
              id="view-resume-btn"
              disabled={isLoadingResume}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isLoadingResume ? 'Generating Resume...' : 'View ATS Resume'}
            </button>

            <button
              onClick={handleViewMatchingJobs}
              className="btn btn-outline"
              id="view-matching-jobs-btn"
              disabled={isLoadingJobs || !hasJobMatches}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 13.255A23.9 23.9 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m-2 0h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isLoadingJobs ? 'Finding Jobs...' : hasJobMatches ? 'View Matching Jobs' : 'No Matching Jobs Found'}
            </button>

            <button onClick={() => navigate('/analyze')} className="btn btn-primary" id="report-back-analyze-btn">
              Start New Analysis
            </button>
          </motion.div>

          {jobsWarning && (
            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {jobsWarning}
            </p>
          )}

        </div>
      </div>

      <Footer />
    </PageTransition>
  )
}

export default InterviewReport