import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAI from '../../../context/useAI'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import PageTransition from '../../../components/ui/PageTransition'

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

// ─── Accent palette — cycles per card so the grid doesn't feel monotone ───
const ACCENTS = [
    { accent: '#6366F1', soft: '#EEF2FF', glow: 'rgba(99, 102, 241, 0.25)' },   // indigo
    { accent: '#EC4899', soft: '#FDF2F8', glow: 'rgba(236, 72, 153, 0.25)' },   // pink
    { accent: '#14B8A6', soft: '#F0FDFA', glow: 'rgba(20, 184, 166, 0.25)' },   // teal
    { accent: '#F97316', soft: '#FFF7ED', glow: 'rgba(249, 115, 22, 0.25)' },   // orange
    { accent: '#8B5CF6', soft: '#F5F3FF', glow: 'rgba(139, 92, 246, 0.25)' },   // violet
    { accent: '#0EA5E9', soft: '#F0F9FF', glow: 'rgba(14, 165, 233, 0.25)' },   // sky
]

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

// ─── A modular sub-container inside a card ───
const CardBlock = ({ children, style = {} }) => (
    <div
        className="card-block"
        style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '16px 18px',
            ...style,
        }}
    >
        {children}
    </div>
)

const JobCard = ({ job, index, isInterested, onToggleInterest }) => {
    const palette = ACCENTS[index % ACCENTS.length]
    const matchColor = typeof job.matchScore === 'number' ? getMatchColor(job.matchScore) : null

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, boxShadow: `0 20px 40px -12px ${palette.glow}` }}
            className="job-card"
            style={{
                background: 'var(--color-surface)',
                border: `1px solid ${palette.accent}30`,
                borderRadius: '20px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                height: '460px',
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            {/* Soft background wash */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '160px',
                    height: '160px',
                    background: palette.soft,
                    borderRadius: '50%',
                    transform: 'translate(35%, -35%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>

                {/* ─── Block 1: Title + interest toggle ─── */}
                <CardBlock style={{ borderLeft: `4px solid ${palette.accent}`, background: 'var(--color-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '1.375rem', color: 'var(--color-text-primary)', lineHeight: 1.3, wordBreak: 'break-word' }}>
                            {job.title || 'Untitled Role'}
                        </h2>
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onToggleInterest(job.jobId)}
                            aria-label={isInterested ? 'Remove interest' : 'Mark as interested'}
                            style={{
                                flexShrink: 0,
                                border: 'none',
                                background: 'none',
                                color: isInterested ? palette.accent : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                            }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill={isInterested ? 'currentColor' : 'none'}>
                                <path d="M12 21s-6.716-4.35-9.428-8.06C.29 9.66 1.02 5.79 4.2 4.2c2.1-1.05 4.5-.42 5.8 1.4 1.3-1.82 3.7-2.45 5.8-1.4 3.18 1.59 3.91 5.46 1.63 8.74C18.716 16.65 12 21 12 21z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.button>
                    </div>
                </CardBlock>

                {/* ─── Block 2: Company / location ─── */}
                <CardBlock>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        Employer
                    </p>
                    <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-primary)', fontWeight: 600, wordBreak: 'break-word' }}>
                        {job.company || 'Not specified'}
                    </p>
                    {job.location && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            {job.location}
                        </p>
                    )}
                </CardBlock>

                {/* ─── Block 3: Match score (fills remaining space, so cards stay height-consistent) ─── */}
                <CardBlock style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: matchColor ? matchColor.bg : 'var(--color-bg)' }}>
                    {matchColor ? (
                        <>
                            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: matchColor.color, lineHeight: 1 }}>
                                {job.matchScore}%
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: matchColor.color, marginTop: '6px' }}>
                                Match Score
                            </span>
                        </>
                    ) : (
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            Match score unavailable
                        </span>
                    )}
                </CardBlock>

                {/* ─── Block 4: Posted date + Apply action ─── */}
                <CardBlock style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {formatPostedDate(job.postedDate)}
                    </span>
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            padding: '10px 20px',
                            borderRadius: '999px',
                            background: palette.accent,
                            color: '#fff',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Apply →
                    </motion.a>
                </CardBlock>
            </div>
        </motion.div>
    )
}

const MatchedJobs = () => {
    const navigate = useNavigate()
    const { jobMatches, isLoadingJobs, jobsWarning } = useAI()

    const jobs = useMemo(() => jobMatches || [], [jobMatches])
    const [interestedIds, setInterestedIds] = useState(() => loadInterestedIds())

    useEffect(() => {
        try {
            localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(Array.from(interestedIds)))
        } catch {
            // storage unavailable — interest toggle still works for the session
        }
    }, [interestedIds])

    // Inject responsive styles once, cleaned up on unmount so it never
    // duplicates across navigations or Fast Refresh reloads.
    useEffect(() => {
        const style = document.createElement('style')
        style.innerHTML = `
            @media (max-width: 820px) {
                .job-card { min-height: auto !important; padding: 20px !important; }
                .job-card .card-block { padding: 12px 14px !important; }
            }
            @media (max-width: 420px) {
                .job-card { padding: 16px !important; gap: 12px !important; }
                .job-card .card-block { padding: 10px 12px !important; }
            }
        `
        document.head.appendChild(style)
        return () => {
            document.head.removeChild(style)
        }
    }, [])

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
            <Navbar />

            <div style={{ paddingTop: '72px', minHeight: '100vh' }}>
                <div className="container" style={{ padding: '48px 24px 80px', maxWidth: '1080px', margin: '0 auto' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            marginBottom: '20px',
                            padding: 0,
                        }}
                    >
                        ← Back
                    </button>

                    <h1 style={{ fontWeight: 700, fontSize: '1.75rem', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                        Matching Jobs
                    </h1>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                        {jobs.length > 0
                            ? `${jobs.length} role${jobs.length === 1 ? '' : 's'} matched to your resume`
                            : ''}
                    </p>

                    {isLoadingJobs ? (
                        <p style={{ color: 'var(--color-text-secondary)' }}>Finding jobs that match your resume...</p>
                    ) : jobs.length > 0 ? (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '28px',

                            }}
                        >
                            {jobs.map((job, i) => (
                                <JobCard
                                    key={job.jobId || i}
                                    job={job}
                                    index={i}
                                    isInterested={interestedIds.has(job.jobId)}
                                    onToggleInterest={handleToggleInterest}
                                />
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {jobsWarning || 'No matching jobs found right now — check back later.'}
                        </p>
                    )}
                </div>
            </div>

            <Footer />
        </PageTransition>
    )
}

export default MatchedJobs