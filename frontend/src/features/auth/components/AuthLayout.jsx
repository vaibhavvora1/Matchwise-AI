import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const BRAND_FEATURES = [
  { icon: '📄', text: 'ATS-optimized resumes in seconds' },
  { icon: '🎯', text: 'Personalized interview reports' },
  { icon: '📈', text: 'Skill gap analysis & 7-day prep plan' },
]

const AuthLayout = ({ children, reverse = false }) => {
  const shouldReduceMotion = useReducedMotion()
  const Container = shouldReduceMotion ? 'div' : motion.div

  const formSide = (
    <Container
      key="form-side"
      className="auth-side"
      {...(!shouldReduceMotion && { layout: true })}
      transition={!shouldReduceMotion ? { layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '40px 36px' }}>
        {children}
      </div>
    </Container>
  )

  const brandSide = (
    <Container
      key="brand-side"
      className="auth-side"
      {...(!shouldReduceMotion && { layout: true })}
      transition={!shouldReduceMotion ? { layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } : undefined}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 40px',
        background: 'linear-gradient(135deg, var(--color-text-primary) 0%, #1E1B4B 100%)',
        color: 'white',
        minHeight: '280px',
      }}
    >
      <div className="hero-blob hero-blob-1" style={{ opacity: 0.5 }} />
      <div className="hero-blob hero-blob-2" style={{ opacity: 0.5 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '999px',
            padding: '6px 14px',
            marginBottom: '28px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              background: '#818CF8',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }}
          />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#C7D2FE' }}>
            MatchWise AI
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}
        >
          Land your next role, faster.
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.7,
            marginBottom: '36px',
          }}
        >
          AI-powered resume optimization and interview prep, tailored to every job you apply for.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {BRAND_FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.9)' }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </Container>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background, #FAFAFA)', position: 'relative' }}>
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: '18px',
          left: '18px',
          zIndex: 20,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 14px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
          color: '#08090d',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 700,
          boxShadow: '0 12px 28px rgba(245, 158, 11, 0.18)',
        }}
      >
        Home
      </Link>
      <div
        className="auth-grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr', minHeight: '100vh' }}
      >

        {reverse ? (
          <>
            {formSide}
            {brandSide}
          </>
        ) : (
          <>
            {brandSide}
            {formSide}
          </>
        )}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-grid { grid-template-columns: 1.1fr 0.9fr !important; }
        }
        @media (max-width: 640px) {
          .auth-grid > div { min-height: auto !important; }
          .auth-grid .card { padding: 20px !important; }
          .auth-side { padding: 24px !important; }
        }
      `}</style>
    </div>
  )
}

export default AuthLayout