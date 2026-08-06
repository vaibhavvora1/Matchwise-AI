import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AccordionItem = ({ question, intention, howToAnswer, index }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'var(--color-surface)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: isOpen ? 'var(--shadow-sm)' : 'none',
        borderColor: isOpen ? 'var(--color-highlight)' : 'var(--color-border)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(p => !p)}
        style={{
          width: '100%',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        id={`accordion-${index}`}
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <span style={{
            flexShrink: 0,
            width: '28px', height: '28px',
            background: isOpen ? 'var(--color-indigo-50)' : '#F4F4F5',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: isOpen ? 'var(--color-highlight)' : 'var(--color-text-muted)',
            transition: 'all 0.2s',
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--color-text-primary)',
            lineHeight: 1.5,
          }}>
            {question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ flexShrink: 0, color: isOpen ? 'var(--color-highlight)' : 'var(--color-text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 20px 20px',
              paddingLeft: '62px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {intention && (
                <div style={{
                  background: 'var(--color-indigo-50)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  borderLeft: '3px solid var(--color-highlight)',
                }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-highlight)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Interviewer's Intention
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                    {intention}
                  </p>
                </div>
              )}
              {howToAnswer && (
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    How to Answer
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.75 }}>
                    {howToAnswer}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AccordionItem
