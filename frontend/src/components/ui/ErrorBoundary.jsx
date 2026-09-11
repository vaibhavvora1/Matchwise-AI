import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary caught error]', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg, #fdfbf7)',
            padding: '24px',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border, rgba(245, 158, 11, 0.2))',
              borderRadius: '24px',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 20px 40px -6px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Warning icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--color-text-primary, #18181b)',
                marginBottom: '12px',
                lineHeight: 1.3,
              }}
            >
              Something Went Wrong
            </h1>

            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--color-text-secondary, #475569)',
                marginBottom: '28px',
                lineHeight: 1.6,
              }}
            >
              An unexpected error occurred in the application.
              Please try refreshing the page or navigating back to the home screen.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#08090d',
                  fontWeight: 700,
                  padding: '12px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>

              <a
                href="/"
                onClick={this.handleReset}
                className="btn btn-outline"
                style={{
                  padding: '12px 24px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
