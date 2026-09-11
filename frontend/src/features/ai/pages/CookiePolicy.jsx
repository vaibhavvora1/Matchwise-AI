import { Link } from 'react-router-dom'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import SEO from '../../../components/ui/SEO'
import PageTransition from '../../../components/ui/PageTransition'

const CookiePolicy = () => {
  return (
    <PageTransition>
      <SEO
        title="MatchWise AI — Cookie Policy"
        description="Learn about the essential cookies and token-based authentication used by MatchWise AI to keep your session secure."
        canonical="https://matchwiseai.com/cookie-policy"
      />
      <Navbar />

      <main
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          paddingBottom: '80px',
          background: 'var(--color-bg, #fdfbf7)',
        }}
      >
        <div className="container" style={{ maxWidth: '840px', margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#d97706',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(245, 158, 11, 0.12)',
                padding: '6px 14px',
                borderRadius: '999px',
                display: 'inline-block',
                marginBottom: '16px',
              }}
            >
              Security & Compliance
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 700,
                color: '#18181b',
                lineHeight: 1.2,
                marginBottom: '12px',
              }}
            >
              Cookie Policy
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
              Last updated: August 14, 2026
            </p>
          </div>

          {/* Content Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: 'clamp(24px, 5vw, 48px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              color: '#334155',
              lineHeight: 1.75,
              fontSize: '0.95rem',
            }}
          >
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                1. What Are Cookies?
              </h2>
              <p>
                Cookies are small text files stored on your browser when visiting websites. They help remember authentication states and improve overall site security.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                2. How MatchWise AI Uses Cookies
              </h2>
              <p style={{ marginBottom: '12px' }}>
                MatchWise AI strictly uses essential cookies for:
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Session Authentication:</strong> Secure HTTP-only cookies containing JWT tokens to keep you logged in.</li>
                <li><strong>Security & Anti-CSRF:</strong> Protecting account access and API requests against cross-site vulnerabilities.</li>
              </ul>
              <p style={{ marginTop: '12px' }}>
                We do not sell advertising tracking cookies or third-party marketing beacons.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                3. Managing Cookies
              </h2>
              <p>
                You can manage cookie settings in your web browser preferences. However, disabling essential cookies will prevent logging in to MatchWise AI and accessing secure features like resume analysis history.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                4. Support Contact
              </h2>
              <p>
                For further information on our cookie practices, feel free to contact us:
              </p>
              <div
                style={{
                  marginTop: '12px',
                  padding: '16px',
                  background: '#fef3c7',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div><strong>Helpline:</strong> <a href="tel:8153875076" style={{ color: '#d97706', fontWeight: 700 }}>8153875076</a></div>
                <div><strong>Instagram:</strong> <a href="https://instagram.com/ivaibhavora" target="_blank" rel="noopener noreferrer" style={{ color: '#d97706', fontWeight: 700 }}>@ivaibhavora</a></div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  )
}

export default CookiePolicy
