const StarIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.75l2.8 5.67 6.25.91-4.52 4.4 1.07 6.23L12 17.02l-5.6 2.94 1.07-6.23-4.52-4.4 6.25-.91L12 2.75z"
      fill={filled ? '#f59e0b' : 'none'}
      stroke={filled ? '#f59e0b' : '#a8a29e'}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
)

const FeedbackRating = ({ value, onChange, disabled = false, size = 44 }) => {
  return (
    <div
      role="radiogroup"
      aria-label="Feedback rating"
      style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
          disabled={disabled}
          onClick={() => onChange(rating)}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid transparent',
            borderRadius: '10px',
            background: rating <= value ? 'rgba(245, 158, 11, 0.12)' : '#ffffff',
            color: rating <= value ? '#f59e0b' : '#a8a29e',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 0.18s ease, transform 0.18s ease',
          }}
          onMouseEnter={(event) => {
            if (!disabled) event.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <StarIcon filled={rating <= value} />
        </button>
      ))}
    </div>
  )
}

export default FeedbackRating

