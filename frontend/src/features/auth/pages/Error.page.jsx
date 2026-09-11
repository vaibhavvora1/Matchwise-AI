import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEO from '../../../components/ui/SEO'

const ErrorPage = () => {
  const navigate = useNavigate()

  return (
    <>
      <SEO
        title="Page Not Found — MatchWise AI"
        description="The page you are looking for does not exist or has been moved. Return home to continue optimizing your resume and job match score."
        noindex={true}
      />

      <main
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-bg, #fdfbf7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background glow blobs matching brand identity */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(244, 63, 94, 0.05) 50%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            filter: 'blur(50px)',
          }}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, rgba(245, 158, 11, 0.25))',
            borderRadius: '28px',
            padding: '48px 36px',
            textAlign: 'center',
            boxShadow: '0 20px 40px -6px rgba(0, 0, 0, 0.06), 0 0 25px 0 rgba(245, 158, 11, 0.08)',
            position: 'relative',
            zIndex: 1,
            boxSizing: 'border-box',
          }}
        >
          {/* Header Branding */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '32px',
            }}
            aria-label="MatchWise AI Home"
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f43f5e 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="8.5" cy="12" r="5.5" stroke="white" strokeWidth="2" />
                <circle cx="15.5" cy="12" r="5.5" stroke="white" strokeWidth="2" />
                <path d="M9.5 12.5l2 2 4-4.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: '#18181b',
                letterSpacing: '-0.01em',
              }}
            >
              MatchWise<span style={{ color: '#d97706', fontStyle: 'italic', fontWeight: 600 }}>AI</span>
            </span>
          </Link>

          {/* 404 Large Visual Graphic */}
          <div
            style={{
              display: 'inline-block',
              position: 'relative',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(5rem, 15vw, 7.5rem)',
                fontWeight: 900,
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f43f5e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.04em',
                userSelect: 'none',
                display: 'block',
              }}
            >
              404
            </span>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#d97706',
                background: 'rgba(245, 158, 11, 0.12)',
                padding: '4px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'inline-block',
                marginTop: '-10px',
              }}
            >
              Page Not Found
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #18181b)',
              marginBottom: '12px',
              lineHeight: 1.3,
            }}
          >
            Looking for a role that moved?
          </h1>

          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-secondary, #475569)',
              marginBottom: '32px',
              lineHeight: 1.6,
            }}
          >
            The page you tried to access doesn&apos;t exist or has been relocated. Return to MatchWise AI to continue optimizing your resume and interview preparation.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Link
              to="/"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#08090d',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                padding: '12px 26px',
                borderRadius: '999px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '44px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Home
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                color: 'var(--color-text-secondary, #475569)',
                border: '1.5px solid var(--color-border, rgba(245, 158, 11, 0.3))',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                padding: '11px 22px',
                borderRadius: '999px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d97706'
                e.currentTarget.style.color = '#18181b'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border, rgba(245, 158, 11, 0.3))'
                e.currentTarget.style.color = 'var(--color-text-secondary, #475569)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Go Back
            </button>
          </div>
        </motion.div>

        {/* Footer info */}
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted, #64748b)',
            marginTop: '32px',
            textAlign: 'center',
          }}
        >
          &copy; {new Date().getFullYear()} MatchWise AI. Built to get you hired.
        </p>
      </main>
    </>
  )
}

export default ErrorPage