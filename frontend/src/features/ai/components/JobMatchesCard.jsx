import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'

const formatPostedDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return ''
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
}

const getMatchColor = (score) => {
    if (score >= 71) return { color: '#22C55E', bg: '#F0FDF4', border: '#22C55E40' }
    if (score >= 41) return { color: '#F59E0B', bg: '#FFFBEB', border: '#F59E0B40' }
    return { color: '#EF4444', bg: '#FEF2F2', border: '#EF444440' }
}

const MatchBadge = ({ score }) => {
    if (typeof score !== 'number') return null
    const c = getMatchColor(score)
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: c.bg,
                color: c.color,
                border: `1px solid ${c.border}`,
                flexShrink: 0,
            }}
        >
            {score}% match
        </span>
    )
}

const JobMatchesCard = React.memo(({ jobs, isLoadingJobs, jobsWarning }) => {
    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginBottom: '14px' }}>
                Matching Jobs
            </h3>

            {isLoadingJobs ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    <LoadingSpinner size={16} />
                    Finding jobs that match your resume...
                </div>
            ) : jobs && jobs.length > 0 ? (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {jobs.slice(0, 5).map((job, i) => (
                            <motion.div
                                key={job.jobId || i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                style={{
                                    paddingBottom: '14px',
                                    borderBottom: i < Math.min(jobs.length, 5) - 1 ? '1px solid var(--color-border)' : 'none',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                                        {job.title}
                                    </p>
                                    <MatchBadge score={job.matchScore} />
                                </div>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                    {job.company}{job.location ? ` · ${job.location}` : ''}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {formatPostedDate(job.postedDate)}
                                    </span>
                                    <a
                                        href={job.applyLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline btn-sm"
                                        style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                                    >
                                        Apply Now
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <Link
                        to="/match-jobs"
                        className="btn btn-outline btn-sm"
                        id="view-matching-jobs-btn"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            marginTop: '16px',
                            width: '100%',
                        }}
                    >
                        View Matching Jobs
                    </Link>
                </>
            ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {jobsWarning || 'No matching jobs found right now — check back later.'}
                </p>
            )}
        </motion.div>
    )
})

JobMatchesCard.displayName = 'JobMatchesCard'

export default JobMatchesCard