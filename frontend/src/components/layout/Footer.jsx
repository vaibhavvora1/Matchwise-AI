import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
  Product: [
    { label: 'ATS Resume', href: '/analyze' },
    { label: 'Interview Prep', href: '/#features' },
    { label: 'Skill Gap Analysis', href: '/analyze' },
  ],
  Company: [
    { label: 'About Us', href: './about' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
}

const Footer = () => {
  return (
    <footer
      style={{
        background: '#fdfbf7',
        borderTop: '1px solid rgba(245, 158, 11, 0.2)',
        marginTop: '0px',
      }}
    >
      <div className="container" style={{ padding: '64px 24px 40px' }}>
        {/* Top */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr repeat(3, auto)',
            gap: '48px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            flexWrap: 'wrap',
          }}
        >
          {/* Brand */}
          <div style={{ maxWidth: '280px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f43f5e 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.2)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="8.5" cy="12" r="5.5" stroke="white" strokeWidth="2" />
                  <circle cx="15.5" cy="12" r="5.5" stroke="white" strokeWidth="2" />
                  <path d="M9.5 12.5l2 2 4-4.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.25rem', color: '#18181b' }}>
                MatchWise<span style={{ color: '#d97706', fontStyle: 'italic' }}>AI</span>
              </span>
            </Link>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.7 }}>
              Empowering job seekers to defeat ATS filters, master interviews, and secure their next offer.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
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
                {section}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      style={{
                        color: '#64748b',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.target.style.color = '#d97706')}
                      onMouseLeave={(e) => (e.target.style.color = '#64748b')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
            © {new Date().getFullYear()} MatchWise AI. All rights reserved.
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Built with ❤️ for job seekers everywhere — Get closer to your next offer
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
