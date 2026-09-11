import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import SEO from '../../../components/ui/SEO'
import PageTransition from '../../../components/ui/PageTransition'
import { useToast } from '../../../components/ui/Toast'

const Contact = () => {
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Question',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Please enter your name'
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.message.trim()) newErrors.message = 'Please enter your message'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    // Simulate swift, responsive support submission
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      addToast('Support message sent successfully! We will get back to you shortly.', 'success')
      setFormData({
        name: '',
        email: '',
        subject: 'General Question',
        message: '',
      })
    }, 800)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <PageTransition>
      <SEO
        title="MatchWise AI — Contact & Support"
        description="Need help with resume analysis or job matching? Contact MatchWise AI support via helpline 8153875076 or Instagram @ivaibhavora."
        canonical="https://matchwiseai.com/contact"
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
        <div className="container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
              We are here to help
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                fontWeight: 700,
                color: '#18181b',
                lineHeight: 1.15,
                marginBottom: '16px',
              }}
            >
              MatchWise AI Support
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
              Have questions about your resume score, ATS optimization, or account settings? Reach out to our dedicated support team.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px',
              alignItems: 'start',
            }}
          >
            {/* Direct Support Channels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '32px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Support Helpline
                    </p>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b' }}>
                      Direct Phone Assistance
                    </h3>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>
                  Connect with our team directly for urgent inquiries, account help, or feedback.
                </p>
                <a
                  href="tel:8153875076"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#d97706',
                    textDecoration: 'none',
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>📞 8153875076</span>
                </a>
              </div>

              {/* Instagram Channel */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '32px',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  boxShadow: '0 4px 20px rgba(244, 63, 94, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Social & Updates
                    </p>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b' }}>
                      Instagram Support
                    </h3>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>
                  Follow us for tips, feature rollouts, and reach out via Direct Messages anytime.
                </p>
                <a
                  href="https://instagram.com/ivaibhavora"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#e11d48',
                    textDecoration: 'none',
                    background: 'rgba(244, 63, 94, 0.1)',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>📷 @ivaibhavora</span>
                </a>
              </div>

              {/* Support Policy Note */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#18181b', marginBottom: '8px' }}>
                  💡 When to Contact Support?
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
                  You should reach out to support if you encounter issues during resume parsing, need guidance on improving your match score, have questions about your subscription/account, or want to report a technical bug.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: 'clamp(24px, 4vw, 40px)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                boxShadow: '0 6px 30px rgba(0,0,0,0.05)',
              }}
            >
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#18181b', marginBottom: '8px' }}>
                Send us a Message
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '28px' }}>
                Fill out the form below and our support team will review your inquiry.
              </p>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #10b981',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '24px',
                      color: '#065f46',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    ✅ Thank you for contacting MatchWise AI support! We have received your message and will respond promptly.
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>
                    Your Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: errors.name ? '1px solid #ef4444' : '1px solid rgba(0,0,0,0.15)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="e.g. alex@example.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: errors.email ? '1px solid #ef4444' : '1px solid rgba(0,0,0,0.15)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.email}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="General Question">General Question</option>
                    <option value="Resume Analysis Issue">Resume Analysis Issue</option>
                    <option value="Job Matching Feedback">Job Matching Feedback</option>
                    <option value="Account & Login Help">Account & Login Help</option>
                    <option value="Bug Report">Bug Report</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>
                    Message <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Describe how we can help you..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: errors.message ? '1px solid #ef4444' : '1px solid rgba(0,0,0,0.15)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.message && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.message}</p>}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#08090d',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                    marginTop: '8px',
                  }}
                >
                  {loading ? 'Sending Message...' : 'Submit Support Request'}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  )
}

export default Contact
