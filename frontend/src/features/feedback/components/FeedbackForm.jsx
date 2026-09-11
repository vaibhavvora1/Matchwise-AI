import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/hooks/userAuth'
import { useToast } from '../../../components/ui/Toast'
import { getErrorMessage } from '../../../services/apiError'
import {
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_MESSAGE_MIN,
  FEEDBACK_TYPES,
} from '../feedback.constants'
import { submitFeedback } from '../services/feedback.api'
import FeedbackRating from './FeedbackRating'

const fieldLabel = {
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: '#18181b',
  marginBottom: '8px',
  display: 'block',
}

const inputBase = {
  width: '100%',
  borderRadius: '10px',
  border: '1px solid rgba(245, 158, 11, 0.28)',
  background: '#ffffff',
  color: '#18181b',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.9375rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const FeedbackForm = ({ onSubmitted, compact = false }) => {
  const { user } = useAuth()
  const { toastSuccess, toastError } = useToast()
  const [rating, setRating] = useState(0)
  const [type, setType] = useState('general')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const characterCount = message.trim().length
  const displayName = useMemo(() => user?.username || 'Anonymous', [user])

  const validate = () => {
    const nextErrors = {}
    const trimmedMessage = message.trim()

    if (!rating) nextErrors.rating = 'Choose a star rating.'
    if (!FEEDBACK_TYPES.some((item) => item.value === type)) {
      nextErrors.type = 'Choose a valid feedback type.'
    }
    if (trimmedMessage.length < FEEDBACK_MESSAGE_MIN) {
      nextErrors.message = `Tell us a little more (${FEEDBACK_MESSAGE_MIN} characters minimum).`
    }
    if (trimmedMessage.length > FEEDBACK_MESSAGE_MAX) {
      nextErrors.message = `Please keep feedback under ${FEEDBACK_MESSAGE_MAX} characters.`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const resetForm = () => {
    setRating(0)
    setType('general')
    setMessage('')
    setErrors({})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')
    setSuccess(false)

    if (!validate()) return

    setSubmitting(true)
    try {
      const data = await submitFeedback({
        rating,
        type,
        message: message.trim(),
      })

      resetForm()
      setSuccess(true)
      toastSuccess('Thanks for your feedback!')
      onSubmitted?.(data)
    } catch (error) {
      const cleanMessage = getErrorMessage(
        error,
        "Couldn't submit your feedback. Please try again.",
      )
      setServerError(cleanMessage)
      toastError(cleanMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: compact ? '16px' : '20px' }}>
      {success && (
        <div
          role="status"
          style={{
            background: '#ecfdf5',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#065f46',
            borderRadius: '12px',
            padding: '14px 16px',
          }}
        >
          <p style={{ fontWeight: 800, marginBottom: '2px' }}>Thanks for your feedback!</p>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            Your feedback helps us improve MatchWise AI.
          </p>
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid rgba(220, 38, 38, 0.24)',
            color: '#b91c1c',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {serverError}
        </div>
      )}

      <div>
        <label style={fieldLabel}>Rating</label>
        <FeedbackRating value={rating} onChange={setRating} disabled={submitting} />
        {errors.rating && (
          <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '6px' }}>
            {errors.rating}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="feedback-type" style={fieldLabel}>Feedback type</label>
        <select
          id="feedback-type"
          value={type}
          disabled={submitting}
          onChange={(event) => setType(event.target.value)}
          style={{
            ...inputBase,
            minHeight: '44px',
            padding: '0 14px',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {FEEDBACK_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '6px' }}>
            {errors.type}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="feedback-message" style={fieldLabel}>Message</label>
        <textarea
          id="feedback-message"
          rows={compact ? 4 : 5}
          value={message}
          disabled={submitting}
          maxLength={FEEDBACK_MESSAGE_MAX}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what you think..."
          style={{
            ...inputBase,
            minHeight: compact ? '128px' : '150px',
            resize: 'vertical',
            padding: '13px 14px',
            lineHeight: 1.6,
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '6px',
            fontSize: '0.75rem',
            color: errors.message ? '#dc2626' : '#78716c',
          }}
        >
          <span>{errors.message || `${displayName} feedback`}</span>
          <span>{characterCount}/{FEEDBACK_MESSAGE_MAX}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          minHeight: '46px',
          border: 'none',
          borderRadius: '12px',
          background: submitting
            ? '#f8d38a'
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#1c1207',
          fontWeight: 800,
          fontSize: '0.95rem',
          fontFamily: 'var(--font-sans)',
          cursor: submitting ? 'wait' : 'pointer',
          boxShadow: '0 8px 22px rgba(217, 119, 6, 0.22)',
        }}
      >
        {submitting ? 'Submitting feedback...' : 'Submit feedback'}
      </button>
    </form>
  )
}

export default FeedbackForm

