const LoadingSpinner = ({ size = 18, color = 'currentColor', label = 'Loading' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    role="status"
    aria-label={label}
    style={{
      display: 'block',
      animation: 'lc-spin 0.8s linear infinite',
    }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="3"
      strokeOpacity="0.25"
    />
    <path
      d="M12 2a10 10 0 0110 10"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

export default LoadingSpinner