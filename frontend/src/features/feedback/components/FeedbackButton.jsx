import { useState } from 'react'
import FeedbackModal from './FeedbackModal'

const FeedbackButton = ({
  children = 'Feedback',
  style,
  className,
  onSubmitted,
  variant = 'primary',
  ariaLabel = 'Open feedback form',
}) => {
  const [open, setOpen] = useState(false)

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '44px',
    padding: '0 18px',
    borderRadius: '12px',
    border: variant === 'ghost' ? '1px solid rgba(245, 158, 11, 0.28)' : 'none',
    background:
      variant === 'ghost'
        ? '#ffffff'
        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: variant === 'ghost' ? '#92400e' : '#1c1207',
    fontWeight: 800,
    fontSize: '0.9rem',
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: variant === 'ghost' ? 'none' : '0 8px 22px rgba(217, 119, 6, 0.22)',
  }

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        style={{ ...baseStyle, ...style }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {children}
      </button>
      <FeedbackModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmitted={onSubmitted}
      />
    </>
  )
}

export default FeedbackButton

