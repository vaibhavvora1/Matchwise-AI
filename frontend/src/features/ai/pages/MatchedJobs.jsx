import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAI from '../../../context/useAI'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import PageTransition from '../../../components/ui/PageTransition'
import SEO from '../../../components/ui/SEO'
import JobMatchCard from '../components/JobMatchCard'
import SkeletonLoader from '../../../components/ui/SkeletonLoader'

const INTEREST_STORAGE_KEY = 'matchwise:interested-jobs'

const loadInterestedIds = () => {
  try {
    const raw = localStorage.getItem(INTEREST_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

const MatchedJobs = () => {
  const navigate = useNavigate()
  const { jobMatches, isLoadingJobs, jobsWarning } = useAI()

  const jobs = useMemo(() => (Array.isArray(jobMatches) ? jobMatches : []), [jobMatches])
  const [interestedIds, setInterestedIds] = useState(() => loadInterestedIds())

  useEffect(() => {
    try {
      localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(Array.from(interestedIds)))
    } catch {
      // Storage fallback
    }
  }, [interestedIds])

  const handleToggleInterest = (jobId) => {
    if (!jobId) return
    setInterestedIds((prev) => {
      const next = new Set(prev)
      if (next.has(jobId)) {
        next.delete(jobId)
      } else {
        next.add(jobId)
      }
      return next
    })
  }

  return (
    <PageTransition>
      <SEO
        title="Matching Jobs — MatchWise AI"
        description="View real-time job openings tailored to your AI-optimized resume, skills, and experience level."
        noindex={true}
      />

      <Navbar />

      <main style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--color-bg, #fdfbf7)' }}>
        <div className="container" style={{ padding: '40px 16px 80px', maxWidth: '1140px', margin: '0 auto' }}>
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary, #475569)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '24px',
              padding: '8px 0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Back to Analysis
          </button>

          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1
              style={{
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                color: 'var(--color-text-primary, #18181b)',
                marginBottom: '8px',
                lineHeight: 1.2,
              }}
            >
              Recommended Job Matches
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary, #475569)', margin: 0 }}>
              {isLoadingJobs
                ? 'Searching top job boards based on your resume profile...'
                : jobs.length > 0
                ? `${jobs.length} tailored role${jobs.length === 1 ? '' : 's'} matching your skill profile and experience.`
                : 'No live matches found for your current resume query.'}
            </p>
          </div>

          {/* Main Grid Content */}
          {isLoadingJobs ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-border, rgba(245, 158, 11, 0.2))',
                    borderRadius: '24px',
                    padding: '24px',
                  }}
                >
                  <SkeletonLoader height="24px" width="70%" style={{ marginBottom: '12px' }} />
                  <SkeletonLoader height="16px" width="40%" style={{ marginBottom: '20px' }} />
                  <SkeletonLoader height="60px" width="100%" style={{ marginBottom: '20px', borderRadius: '16px' }} />
                  <SkeletonLoader height="40px" width="100%" style={{ borderRadius: '999px' }} />
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {jobs.map((job, i) => (
                <JobMatchCard
                  key={job.jobId || i}
                  job={job}
                  isInterested={interestedIds.has(job.jobId)}
                  onToggleInterest={handleToggleInterest}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface, #ffffff)',
                borderRadius: '24px',
                border: '1px solid var(--color-border, rgba(245, 158, 11, 0.25))',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  fontSize: '1.5rem',
                }}
              >
                🔍
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#18181b' }}>
                No Matching Roles Found
              </h2>
              <p style={{ fontSize: '0.9375rem', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
                {jobsWarning ||
                  'We couldn\'t pull live job openings for this specific resume profile right now. Try updating your target job description or uploading a broader resume.'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/analyze')}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#08090d',
                  fontWeight: 700,
                  padding: '12px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Start New Resume Analysis
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </PageTransition>
  )
}

export default MatchedJobs