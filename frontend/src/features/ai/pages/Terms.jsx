import { Link } from 'react-router-dom'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import SEO from '../../../components/ui/SEO'
import PageTransition from '../../../components/ui/PageTransition'

const Terms = () => {
  return (
    <PageTransition>
      <SEO
        title="MatchWise AI — Terms & Conditions"
        description="Read the Terms and Conditions for using MatchWise AI resume analysis, job matching, and interview preparation platform."
        canonical="https://matchwiseai.com/terms"
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
              Legal & Compliance
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
              Terms & Conditions
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
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using MatchWise AI, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                2. User Obligations & Conduct
              </h2>
              <p style={{ marginBottom: '12px' }}>
                When using MatchWise AI, you agree:
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>To provide accurate personal and professional information.</li>
                <li>Not to upload fraudulent, offensive, or malicious documents.</li>
                <li>Not to attempt reverse-engineering or unauthorized access to our system APIs.</li>
                <li>To maintain the confidentiality of your user credentials.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                3. AI Services & Career Disclaimer
              </h2>
              <p>
                MatchWise AI utilizes advanced machine learning tools to evaluate resumes, score job matches, and generate mock interview recommendations. While our feedback aims to improve your hiring prospects, we do not guarantee specific job placements or hiring outcomes.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                4. Intellectual Property
              </h2>
              <p>
                All brand marks, design assets, website software, and platform code are the exclusive property of MatchWise AI. You retain full ownership of the personal resume content and profile details you upload.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                5. Questions & Assistance
              </h2>
              <p>
                For questions concerning these Terms & Conditions, please contact us:
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

export default Terms
