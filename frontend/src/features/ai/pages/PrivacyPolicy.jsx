import { Link } from 'react-router-dom'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import SEO from '../../../components/ui/SEO'
import PageTransition from '../../../components/ui/PageTransition'

const PrivacyPolicy = () => {
  return (
    <PageTransition>
      <SEO
        title="MatchWise AI — Privacy Policy"
        description="Learn how MatchWise AI protects your personal information, processes uploaded resumes in memory, and keeps your career data secure."
        canonical="https://matchwiseai.com/privacy"
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
              Legal & Privacy
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
              Privacy Policy
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
                1. Introduction
              </h2>
              <p>
                At <strong>MatchWise AI</strong>, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy outlines how we collect, process, and safeguard your information when you use our resume analysis, ATS optimization, job matching, and interview preparation services.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                2. Information We Collect
              </h2>
              <p style={{ marginBottom: '12px' }}>
                We collect information directly from you when you register an account, upload documents, or interact with our platform:
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Account Data:</strong> Full name, email address, and encrypted password credentials.</li>
                <li><strong>Uploaded Resumes & Documents:</strong> Content uploaded via PDF format or directly pasted text.</li>
                <li><strong>Career Profile & Inputs:</strong> Target job descriptions, self-declarations, desired roles, and skills.</li>
                <li><strong>Usage Data:</strong> Aggregated analysis scores, generated resume outputs, and mock interview reports stored in your user history.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                3. How We Process Uploaded Files
              </h2>
              <p>
                When you upload a resume file (PDF), MatchWise AI processes the file temporarily in memory using secure server-side buffer parsing to extract textual data for AI evaluation. 
                Original raw file binaries are not stored permanently on public file storage. Your extracted career history and analysis summaries are linked exclusively to your authenticated account in our encrypted database so you can access them in your personal profile.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                4. Data Security & Protection
              </h2>
              <p>
                We enforce industry-standard security practices, including HTTP-only cookies, JSON Web Token (JWT) authentication, password hashing using bcrypt, and TLS encryption for all data in transit. We do not sell, rent, or trade your personal resume data or contact details to third-party recruiters or data brokers.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                5. Cookies & Authentication
              </h2>
              <p>
                MatchWise AI uses essential authentication cookies to securely verify your identity across session requests. For more details, please visit our <Link to="/cookie-policy" style={{ color: '#d97706', fontWeight: 600 }}>Cookie Policy</Link>.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b', marginBottom: '12px' }}>
                6. Contact & Support
              </h2>
              <p>
                If you have questions regarding this Privacy Policy or wish to exercise your data access or deletion rights, please reach out to our support team:
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
                <div><strong>Support Helpline:</strong> <a href="tel:8153875076" style={{ color: '#d97706', fontWeight: 700 }}>8153875076</a></div>
                <div><strong>Instagram Support:</strong> <a href="https://instagram.com/ivaibhavora" target="_blank" rel="noopener noreferrer" style={{ color: '#d97706', fontWeight: 700 }}>@ivaibhavora</a></div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  )
}

export default PrivacyPolicy
