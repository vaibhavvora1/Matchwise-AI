import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Context ─── */
const ToastContext = createContext(null)

/* ─── Icons ─── */
const icons = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const toastStyles = {
  success: { bg: '#F0FDF4', border: '#86EFAC', color: '#15803D' },
  error:   { bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C' },
  info:    { bg: '#EEF2FF', border: '#C7D2FE', color: '#4338CA' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' },
}

/* ─── Single Toast Item ─── */
const ToastItem = ({ id, type = 'info', message, onDismiss }) => {
  const style = toastStyles[type] || toastStyles.info
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        borderRadius: '10px',
        padding: '12px 16px',
        minWidth: '280px',
        maxWidth: '360px',
        boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
        pointerEvents: 'auto',
      }}
    >
      <span style={{ flexShrink: 0, marginTop: '1px' }}>{icons[type]}</span>
      <p style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 }}>
        {message}
      </p>
      <button
        onClick={() => onDismiss(id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: style.color, opacity: 0.6, padding: '2px',
          flexShrink: 0, lineHeight: 1,
        }}
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  )
}

/* ─── Provider ─── */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const toastSuccess = useCallback((msg, duration) => toast(msg, 'success', duration), [toast])
  const toastError   = useCallback((msg, duration) => toast(msg, 'error',   duration), [toast])
  const toastInfo    = useCallback((msg, duration) => toast(msg, 'info',    duration), [toast])
  const toastWarn    = useCallback((msg, duration) => toast(msg, 'warning', duration), [toast])

  return (
    <ToastContext.Provider value={{ toast, toastSuccess, toastError, toastInfo, toastWarn, dismiss }}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem key={t.id} {...t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

/* ─── Hook ─── */
export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default ToastProvider
