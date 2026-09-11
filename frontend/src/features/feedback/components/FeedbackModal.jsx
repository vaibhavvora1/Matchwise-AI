import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import FeedbackForm from './FeedbackForm'

const FeedbackModal = ({ open, onClose, onSubmitted }) => {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const handleSubmitted = (data) => {
    onSubmitted?.(data)
    window.setTimeout(onClose, 1600)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(5px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 330, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            style={{
              width: 'min(100%, 560px)',
              maxHeight: 'min(88vh, 760px)',
              overflowY: 'auto',
              background: '#fffcf8',
              border: '1px solid rgba(245, 158, 11, 0.24)',
              borderRadius: '18px',
              boxShadow: '0 28px 80px rgba(15, 23, 42, 0.24)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '24px 24px 18px',
                borderBottom: '1px solid rgba(245, 158, 11, 0.18)',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#0f6e56',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  MatchWise AI feedback
                </p>
                <h2
                  id="feedback-dialog-title"
                  style={{
                    fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
                    lineHeight: 1.18,
                    color: '#18181b',
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  Help shape what gets better next
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close feedback form"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.24)',
                  background: '#ffffff',
                  color: '#92400e',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div style={{ padding: '22px 24px 24px' }}>
              <FeedbackForm onSubmitted={handleSubmitted} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FeedbackModal

