import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import JobMatchCard from './JobMatchCard'

const JobMatchesCard = React.memo(({ jobs, isLoadingJobs, jobsWarning }) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3
          style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--color-text-primary, #18181b)',
            margin: 0,
          }}
        >
          Matching Job Openings
        </h3>
        {jobs && jobs.length > 0 && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#d97706',
              background: 'rgba(245, 158, 11, 0.12)',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            {jobs.length} Found
          </span>
        )}
      </div>

      {isLoadingJobs ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary, #475569)',
            padding: '24px 16px',
            backgroundColor: 'var(--color-bg, #fdfbf7)',
            borderRadius: '16px',
            border: '1px dashed var(--color-border, rgba(245, 158, 11, 0.3))',
          }}
        >
          <LoadingSpinner size={20} />
          <span>Analyzing role specifications & finding real-time job matches...</span>
        </div>
      ) : jobs && jobs.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {jobs.slice(0, 4).map((job, i) => (
              <JobMatchCard key={job.jobId || i} job={job} compact={true} />
            ))}
          </div>

          <Link
            to="/match-jobs"
            className="btn btn-outline btn-sm"
            id="view-matching-jobs-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              textAlign: 'center',
              marginTop: '4px',
              width: '100%',
              borderRadius: '999px',
              fontWeight: 600,
            }}
          >
            View All Matching Jobs ({jobs.length}) →
          </Link>
        </>
      ) : (
        <div
          style={{
            padding: '20px 16px',
            borderRadius: '16px',
            backgroundColor: 'var(--color-bg, #fdfbf7)',
            border: '1px solid var(--color-border, rgba(245, 158, 11, 0.2))',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted, #64748b)',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0 }}>
            {jobsWarning || 'No matching jobs found right now — check back later or update your resume parameters.'}
          </p>
        </div>
      )}
    </motion.div>
  )
})

JobMatchesCard.displayName = 'JobMatchesCard'

export default JobMatchesCard