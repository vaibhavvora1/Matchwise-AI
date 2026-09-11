import { Link } from 'react-router-dom'
import FeedbackButton from '../../features/feedback/components/FeedbackButton'

const FOOTER_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Features', href: '/#features' },
  { label: 'Resume Analyzer', href: '/analyze' },
  { label: 'Job Matches', href: '/match-jobs' },
  { label: 'Interview Report', href: '/interview-report' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact & Support', href: '/contact' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
]

const Footer = () => {
  return (
    <footer
      role="contentinfo"
      aria-label="Site Footer"
      style={{
        background: '#fdfbf7',
        borderTop: '1px solid rgba(245, 158, 11, 0.2)',
        marginTop: '0px',
        color: '#334155',
      }}
    >
      <div className="container" style={{ padding: '64px 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Main Grid */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
            gap: '40px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: '320px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f43f5e 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.25)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="8.5" cy="12" r="5.5" stroke="white" strokeWidth="2" />
                  <circle cx="15.5" cy="12" r="5.5" stroke="white" strokeWidth="2" />
                  <path d="M9.5 12.5l2 2 4-4.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.3rem', color: '#18181b' }}>
                MatchWise<span style={{ color: '#d97706', fontStyle: 'italic' }}>AI</span>
              </span>
            </Link>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '20px' }}>
              Empowering job seekers to defeat ATS filters, master interviews, and secure their next offer.
            </p>
            {/* Social Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <a
                href="https://instagram.com/ivaibhavora"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MatchWise AI Instagram Profile @ivaibhavora"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  background: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  color: '#e11d48',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e11d48'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)'
                  e.currentTarget.style.color = '#e11d48'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>@ivaibhavora</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer Quick Links">
            <h4
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#18181b',
                marginBottom: '18px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FOOTER_NAV.map((link) => (
                <li key={link.label}>
                  {link.href.includes('#') ? (
                    <a
                      href={link.href}
                      style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.target.style.color = '#d97706')}
                      onMouseLeave={(e) => (e.target.style.color = '#64748b')}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.target.style.color = '#d97706')}
                      onMouseLeave={(e) => (e.target.style.color = '#64748b')}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Footer Legal Links">
            <h4
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#18181b',
                marginBottom: '18px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Legal
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.target.style.color = '#d97706')}
                    onMouseLeave={(e) => (e.target.style.color = '#64748b')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <div>
            <h4
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#18181b',
                marginBottom: '18px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Support Helpline:</p>
                <a
                  href="tel:8153875076"
                  aria-label="Call MatchWise AI Helpline 8153875076"
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#d97706',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d97706'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'
                    e.currentTarget.style.color = '#d97706'
                  }}
                >
                  📞 8153875076
                </a>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5, marginTop: '4px' }}>
                Need technical assistance or account help? Contact support anytime.
              </p>
              <FeedbackButton
                variant="ghost"
                ariaLabel="Share feedback about MatchWise AI"
                style={{
                  alignSelf: 'flex-start',
                  minHeight: '40px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                }}
              >
                Share feedback
              </FeedbackButton>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            paddingTop: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            © 2026 MatchWise AI. All rights reserved.
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Built with ❤️ for job seekers everywhere — Get closer to your next offer
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 540px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
