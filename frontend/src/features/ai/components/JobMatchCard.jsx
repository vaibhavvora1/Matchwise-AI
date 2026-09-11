/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { motion } from 'framer-motion'

// Helper to format posted date
export const formatPostedDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Posted today'
  if (days === 1) return 'Posted 1 day ago'
  return `Posted ${days} days ago`
}

// Helper to determine match level & styling with accessible contrast and icon
export const getMatchDetails = (score) => {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return {
      label: 'Match Unknown',
      color: '#64748b',
      bg: '#f8fafc',
      border: '#cbd5e1',
      barColor: '#94a3b8',
      icon: '❓',
    }
  }
  if (score >= 75) {
    return {
      label: 'High Match',
      color: '#15803d', // Green
      bg: '#f0fdf4',
      border: 'rgba(34, 197, 94, 0.4)',
      barColor: '#22c55e',
      icon: '🔥',
    }
  }
  if (score >= 50) {
    return {
      label: 'Good Match',
      color: '#b45309', // Amber
      bg: '#fffbeb',
      border: 'rgba(245, 158, 11, 0.4)',
      barColor: '#f59e0b',
      icon: '⚡',
    }
  }
  return {
    label: 'Moderate Match',
    color: '#b91c1c', // Red
    bg: '#fef2f2',
    border: 'rgba(239, 68, 68, 0.4)',
    barColor: '#ef4444',
    icon: '💡',
  }
}

// ─── Circular Match Score Ring Visual Component ───
export const MatchScoreRing = ({ score, size = 64 }) => {
  const match = getMatchDetails(score)
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const validScore = typeof score === 'number' ? Math.min(Math.max(score, 0), 100) : 0
  const offset = circumference - (validScore / 100) * circumference

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-label={`Match Score ${validScore}% (${match.label})`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0, 0, 0, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={match.barColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: size > 50 ? '0.95rem' : '0.75rem',
            fontWeight: 800,
            color: match.color,
            lineHeight: 1,
          }}
        >
          {validScore}%
        </span>
      </div>
    </div>
  )
}

// ─── Main JobMatchCard Component ───
const JobMatchCard = ({
  job = {},
  isInterested = false,
  onToggleInterest = null,
  compact = false,
  className = '',
}) => {
  const [saved, setSaved] = useState(isInterested)
  const match = getMatchDetails(job.matchScore)

  const handleInterestToggle = () => {
    setSaved((prev) => !prev)
    if (onToggleInterest && job.jobId) {
      onToggleInterest(job.jobId)
    }
  }

  // Work type badge helper (Remote / Hybrid / On-site)
  const workType = job.workType || job.jobType || (job.location?.toLowerCase().includes('remote') ? 'Remote' : null)

  // Company logo fallback (First letter badge)
  const companyInitial = (job.company || 'C').charAt(0).toUpperCase()

  if (compact) {
    return (
      <div
        className={`job-match-card-compact ${className}`}
        style={{
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid var(--color-border, rgba(245, 158, 11, 0.2))',
          backgroundColor: 'var(--color-surface, #ffffff)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={`${job.company} logo`}
                style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.25))',
                  color: '#d97706',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.9rem',
                }}
              >
                {companyInitial}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h4
                style={{
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: 'var(--color-text-primary, #18181b)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={job.title || 'Untitled Role'}
              >
                {job.title || 'Untitled Role'}
              </h4>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary, #475569)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {job.company || 'Company Not Specified'}{job.location ? ` · ${job.location}` : ''}
              </p>
            </div>
          </div>

          <MatchScoreRing score={job.matchScore} size={48} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', pt: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>
            {formatPostedDate(job.postedDate)}
          </span>

          {job.applyLink && (
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '6px 14px',
                borderRadius: '999px',
                textDecoration: 'none',
              }}
            >
              Apply Now →
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.article
      layout
      whileHover={{ y: -4, boxShadow: '0 16px 32px -8px rgba(245, 158, 11, 0.15)' }}
      className={`job-match-card ${className}`}
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, rgba(245, 158, 11, 0.25))',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Top Header: Company Avatar, Title, Location, Save Button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', minWidth: 0 }}>
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={`${job.company} logo`}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                objectFit: 'contain',
                border: '1px solid rgba(0,0,0,0.06)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.25)',
              }}
              aria-hidden="true"
            >
              {companyInitial}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                fontWeight: 700,
                fontSize: '1.125rem',
                color: 'var(--color-text-primary, #18181b)',
                margin: '0 0 4px 0',
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {job.title || 'Untitled Role'}
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #18181b)' }}>
                {job.company || 'Company Not Specified'}
              </span>
              {job.location && (
                <span style={{ color: 'var(--color-text-secondary, #475569)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  • {job.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save / Interested Action */}
        <button
          type="button"
          onClick={handleInterestToggle}
          aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
          style={{
            background: saved ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 0, 0, 0.04)',
            border: 'none',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: saved ? '#d97706' : 'var(--color-text-muted, #64748b)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            touchAction: 'manipulation',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} aria-hidden="true">
            <path
              d="M12 21s-6.716-4.35-9.428-8.06C.29 9.66 1.02 5.79 4.2 4.2c2.1-1.05 4.5-.42 5.8 1.4 1.3-1.82 3.7-2.45 5.8-1.4 3.18 1.59 3.91 5.46 1.63 8.74C18.716 16.65 12 21 12 21z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Match Score Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderRadius: '16px',
          backgroundColor: match.bg,
          border: `1px solid ${match.border}`,
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MatchScoreRing score={job.matchScore} size={54} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1rem' }} aria-hidden="true">{match.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: match.color }}>
                {match.label}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)', margin: '2px 0 0 0' }}>
              Based on your resume skills & experience
            </p>
          </div>
        </div>

        {workType && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: 'var(--color-text-secondary, #475569)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              whiteSpace: 'nowrap',
            }}
          >
            {workType}
          </span>
        )}
      </div>

      {/* Job Information: Badges & Tags (Only show when data exists) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Matched Skills */}
        {Array.isArray(job.matchedSkills) && job.matchedSkills.length > 0 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ✓ Matched Skills:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {job.matchedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {Array.isArray(job.missingSkills) && job.missingSkills.length > 0 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              + Missing Keywords:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {job.missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    backgroundColor: '#fffbeb',
                    color: '#92400e',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta info chips: Salary / Experience / Posted date */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary, #475569)', marginTop: '4px' }}>
          {job.salary && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#047857' }}>
              💰 {job.salary}
            </span>
          )}
          {job.experience && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              💼 {job.experience}
            </span>
          )}
          {job.postedDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted, #64748b)' }}>
              🕒 {formatPostedDate(job.postedDate)}
            </span>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border, rgba(0, 0, 0, 0.06))',
          marginTop: 'auto',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>
          {job.source || 'MatchWise AI Verified'}
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          {job.applyLink ? (
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#08090d',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '9px 18px',
                borderRadius: '999px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              Apply Now →
            </a>
          ) : (
            <button
              disabled
              style={{
                fontSize: '0.8125rem',
                padding: '8px 16px',
                borderRadius: '999px',
                opacity: 0.6,
              }}
            >
              Link Unavailable
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default JobMatchCard
