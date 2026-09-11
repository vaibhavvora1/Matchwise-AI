import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../../services/apiError'
import { formatFeedbackDate } from '../feedback.constants'
import { getApprovedReviews } from '../services/feedback.api'
import FeedbackButton from './FeedbackButton'

const StarDisplay = ({ rating }) => (
  <span
    aria-label={`${rating} out of 5 stars`}
    style={{ display: 'inline-flex', gap: '2px', color: '#f59e0b' }}
  >
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2.75l2.8 5.67 6.25.91-4.52 4.4 1.07 6.23L12 17.02l-5.6 2.94 1.07-6.23-4.52-4.4 6.25-.91L12 2.75z"
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </span>
)

const ReviewCard = ({ review }) => (
  <article
    style={{
      background: '#ffffff',
      border: '1px solid rgba(15, 110, 86, 0.14)',
      borderRadius: '12px',
      padding: '20px',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
      <StarDisplay rating={review.rating} />
      <span
        style={{
          fontSize: '0.72rem',
          color: '#0f6e56',
          background: '#e6f4ef',
          border: '1px solid rgba(15, 110, 86, 0.16)',
          borderRadius: '999px',
          padding: '3px 9px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {review.typeLabel || 'Feedback'}
      </span>
    </div>
    <p
      style={{
        color: '#334155',
        fontSize: '0.95rem',
        lineHeight: 1.65,
        margin: 0,
        overflowWrap: 'anywhere',
      }}
    >
      {review.message}
    </p>
    <footer
      style={{
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        color: '#64748b',
        fontSize: '0.8125rem',
      }}
    >
      <span style={{ fontWeight: 800, color: '#18181b', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {review.displayName || 'Anonymous'}
      </span>
      <time dateTime={review.createdAt}>{formatFeedbackDate(review.createdAt)}</time>
    </footer>
  </article>
)

const ReviewSection = () => {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReviews = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const data = await getApprovedReviews({ page: 1, limit: 6 })
      setReviews(data.reviews || [])
      setStats(data.stats || { totalReviews: 0, averageRating: 0 })
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load reviews right now.'))
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReviews()
    const intervalId = window.setInterval(() => {
      loadReviews({ silent: true })
    }, 45000)

    return () => window.clearInterval(intervalId)
  }, [loadReviews])

  return (
    <section
      id="reviews"
      style={{
        padding: '92px 0',
        background: '#f3fbf7',
        borderTop: '1px solid rgba(15, 110, 86, 0.12)',
        borderBottom: '1px solid rgba(15, 110, 86, 0.12)',
      }}
    >
      <div className="container" style={{ maxWidth: '1120px' }}>
        <div
          className="review-header"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: '28px',
            alignItems: 'end',
            marginBottom: '34px',
          }}
        >
          <div>
            <p
              style={{
                color: '#0f6e56',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Real user reviews
            </p>
            <h2
              style={{
                color: '#151812',
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                lineHeight: 1.12,
                fontWeight: 800,
                maxWidth: '680px',
              }}
            >
              Real feedback from MatchWise AI users
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '12px', justifyItems: 'end' }}>
            {stats.totalReviews > 0 ? (
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#151812', fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>
                  {Number(stats.averageRating || 0).toFixed(1)} / 5
                </p>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '6px' }}>
                  Based on {stats.totalReviews} review{stats.totalReviews === 1 ? '' : 's'}
                </p>
              </div>
            ) : (
              <p style={{ color: '#64748b', maxWidth: '260px', textAlign: 'right', fontSize: '0.95rem' }}>
                Be the first to share your experience with MatchWise AI.
              </p>
            )}
            <FeedbackButton variant="ghost">Share feedback</FeedbackButton>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              border: '1px dashed rgba(15, 110, 86, 0.28)',
              borderRadius: '12px',
              padding: '32px',
              background: '#ffffff',
              color: '#0f6e56',
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            Loading community feedback...
          </div>
        ) : error ? (
          <div
            role="alert"
            style={{
              border: '1px solid rgba(220, 38, 38, 0.22)',
              borderRadius: '12px',
              padding: '18px 20px',
              background: '#fef2f2',
              color: '#b91c1c',
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              border: '1px dashed rgba(15, 110, 86, 0.28)',
              borderRadius: '12px',
              padding: '34px 24px',
              background: '#ffffff',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#151812', fontWeight: 900, marginBottom: '6px' }}>
              No reviews yet. Be the first to share your experience.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
              Approved feedback will appear here after moderation.
            </p>
          </div>
        ) : (
          <div
            className="review-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '16px',
            }}
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .review-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .review-header { grid-template-columns: 1fr !important; }
          .review-header > div:last-child { justify-items: start !important; }
          .review-header > div:last-child p { text-align: left !important; }
        }
        @media (max-width: 560px) {
          .review-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

export default ReviewSection

