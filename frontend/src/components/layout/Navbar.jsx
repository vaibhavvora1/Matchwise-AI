import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useAuth } from '../../features/auth/hooks/userAuth'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Analyze', href: '/analyze' },
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
]

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const location = useLocation()
  const { user } = useAuth()

  const isHashLink = (href) => href.includes('#')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile drawer on route changes only — must NOT depend on
  // mobileOpen itself, or opening the menu re-triggers this and closes
  // it again on the same tick.
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  // Lock body scroll when mobile drawer is open to avoid background interaction
  useEffect(() => {
    try {
      document.body.style.overflow = mobileOpen ? 'hidden' : ''
    } catch (e) {
      // ignore in environments without document
    }
    return () => { try { document.body.style.overflow = '' } catch (e) {} }
  }, [mobileOpen])

  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.header
      className="navbar-header"
      initial={shouldReduceMotion ? false : { y: -80, opacity: 0 }}
      animate={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: scrolled ? 'rgba(253, 251, 247, 0.92)' : 'rgba(253, 251, 247, 0.7)',
        borderBottom: scrolled ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div
        className="container navbar-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f43f5e 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="8.5" cy="12" r="5.5" stroke="white" strokeWidth="2" />
              <circle cx="15.5" cy="12" r="5.5" stroke="white" strokeWidth="2" />
              <path d="M9.5 12.5l2 2 4-4.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              className="navbar-brand-title"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '1.35rem',
                color: '#18181b',
                letterSpacing: '-0.01em',
                lineHeight: 1,
                paddingTop: '2px'
              }}
            >
              MatchWise<span style={{ color: '#d97706', fontStyle: 'italic', fontWeight: 600 }}>AI</span>
            </span>
            <span className="navbar-brand-subtitle" style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Built to get you hired
            </span>
          </div>
        </Link>

        {/* Desktop Flowing Menu Navigation */}
        <nav
          className="desktop-nav desktop-flowing-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: ' 4px',
            borderRadius: '50px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            height: '60px',
            boxSizing: 'border-box',
          }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {NAV_LINKS.map((link, idx) => {
            const isHash = isHashLink(link.href)
            const activeIndex = NAV_LINKS.findIndex((item) => location.pathname === item.href.split('#')[0] && !isHashLink(item.href))
            const highlightIndex = hoveredIdx !== null ? hoveredIdx : activeIndex
            const isHighlighted = idx === highlightIndex
            const isHovered = hoveredIdx === idx

            const content = (
              <motion.span
                className="desktop-flowing-link"
                onMouseEnter={() => setHoveredIdx(idx)}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  boxSizing: 'border-box',
                  padding: '0 14px',
                  borderRadius: 'px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  color: isHighlighted ? '#b45309' : '#334155',
                  textDecoration: 'none',
                  zIndex: 2,
                  transition: 'color 0.2s ease',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.4',
                  paddingTop: '5px',
                }}
              >
                {isHighlighted && (
                  <motion.div
                    layoutId="flowing-menu-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(244, 63, 94, 0.12) 100%)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: '999px',
                      boxShadow: '0 2px 12px rgba(245, 158, 11, 0.15)',
                      zIndex: -1,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                <span
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'inline-block',
                    lineHeight: '1.4',
                    paddingTop: '5px',
                    transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {link.label}
                </span>
              </motion.span>
            )

            return isHash ? (
              <a
                key={link.href}
                href={link.href}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', height: '100%' }}
              >
                {content}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', height: '100%' }}
              >
                {content}
              </Link>
            )
          })}
        </nav>

        {/* CTA & User Profile Actions */}
        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user ? (
            <Link to="/profile" style={{ textDecoration: 'none' }} className="desktop-nav">
              <button
                style={{
                  background: 'transparent',
                  color: '#334155',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0f172a'
                  e.currentTarget.style.borderColor = '#d97706'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#334155'
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)'
                }}
              >
                My Profile
              </button>
            </Link>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }} className="desktop-nav">
              <button
                style={{
                  background: 'transparent',
                  color: '#334155',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#334155')}
              >
                Sign in
              </button>
            </Link>
          )}

          <Link to="/analyze" className="desktop-nav" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#08090d',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '10px 22px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              Get Started Free
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="#08090d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="mobile-menu-btn"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '10px',
              color: '#d97706',
              minWidth: '44px',
              minHeight: '44px',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'manipulation',
              flexShrink: 0,
            }}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            style={{
              background: 'rgba(253, 251, 247, 0.98)',
              borderTop: '1px solid rgba(245, 158, 11, 0.2)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 'calc(100vh - 76px)', overflowY: 'auto' }}>
              {NAV_LINKS.map((link) => {
                const isHash = isHashLink(link.href)
                const linkStyle = {
                  padding: '14px 18px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#18181b',
                  background: 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '44px',
                  lineHeight: '20px',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }

                return isHash ? (
                  <a key={link.href} href={link.href} style={linkStyle} onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} to={link.href} style={linkStyle} onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                )
              })}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '14px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {user ? (
                  <Link to="/profile" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                    <button className="btn" style={{ width: '100%', background: 'rgba(0,0,0,0.05)', color: '#18181b', padding: '12px', minHeight: '44px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                      Profile
                    </button>
                  </Link>
                ) : (
                  <Link to="/login" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                    <button className="btn" style={{ width: '100%', background: 'rgba(0,0,0,0.05)', color: '#18181b', padding: '12px', minHeight: '44px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                      Sign in
                    </button>
                  </Link>
                )}
                <Link to="/analyze" style={{ textDecoration: 'none', display: 'block' }} onClick={() => setMobileOpen(false)}>
                  <button
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#08090d',
                      fontWeight: 700,
                      borderRadius: '12px',
                      border: 'none',
                      minHeight: '44px',
                      cursor: 'pointer',
                    }}
                  >
                    Get Started Free
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .mobile-menu-btn {
          display: none;
        }

        @media (max-width: 900px) {
          .desktop-flowing-nav {
            display: none !important;
          }
          .navbar-actions .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }

        @media (max-width: 480px) {
          .navbar-brand-subtitle {
            display: none;
          }
          .navbar-brand-title {
            font-size: 1.15rem !important;
          }
          .navbar-container {
            height: 64px !important;
          }
        }
      `}</style>

    </motion.header>
  )
}

export default Navbar