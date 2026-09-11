import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import SEO from '../../../components/ui/SEO'
import PageTransition from '../../../components/ui/PageTransition'

const FAQ_DATA = [
  {
    id: 'gen-1',
    category: 'General',
    question: 'What is MatchWise AI?',
    answer:
      'MatchWise AI is an intelligent career platform designed to help job seekers analyze resumes, beat ATS (Applicant Tracking System) filters, discover highly compatible job matches, and practice role-specific mock interview scenarios.',
  },
  {
    id: 'gen-2',
    category: 'General',
    question: 'How does MatchWise AI work?',
    answer:
      'You provide your resume and target job description. MatchWise AI evaluates your skill alignment, generates an ATS-optimized version of your resume, extracts matching job openings from verified platforms, and creates a customized interview preparation guide.',
  },
  {
    id: 'gen-3',
    category: 'General',
    question: 'Who can use MatchWise AI?',
    answer:
      'MatchWise AI is built for students, fresh graduates, active job seekers, career switchers, and experienced professionals across technology, business, design, and other industries.',
  },
  {
    id: 'res-1',
    category: 'Resume',
    question: 'What formats can I upload?',
    answer:
      'MatchWise AI accepts PDF (.pdf) documents up to 10MB. You can also paste your resume or career experience directly into our text analyzer.',
  },
  {
    id: 'res-2',
    category: 'Resume',
    question: 'How does the resume analysis work?',
    answer:
      'Our analyzer parses your text structure, measures keyword density against job descriptions, identifies skill gaps, and suggests concrete line-by-line bullet improvements to boost your ATS pass rate.',
  },
  {
    id: 'job-1',
    category: 'Job Matching',
    question: 'How is the match score calculated?',
    answer:
      'Match scores are computed by comparing extracted technical skills, required experience levels, and role keywords from the job description against your candidate profile, giving you a clear weighted percentage match score.',
  },
  {
    id: 'job-2',
    category: 'Job Matching',
    question: 'Why am I not seeing suitable jobs?',
    answer:
      'Low match results usually happen when resume profiles lack specific technical keywords or when job filters are overly restrictive. Ensure your profile includes your primary tools, technologies, and target job titles.',
  },
  {
    id: 'int-1',
    category: 'Interview',
    question: 'What is the Interview Report?',
    answer:
      'The Interview Report is a personalized preparation breakdown generated for your specific role. It features target behavioral and technical questions, explains what interviewers look for, and provides structured frameworks on how to answer.',
  },
  {
    id: 'priv-1',
    category: 'Privacy & Security',
    question: 'Is my resume data secure?',
    answer:
      'Yes. All data transmitted to MatchWise AI is encrypted over HTTPS/TLS. We implement strict access controls, HTTP-only authentication tokens, and hashed credentials.',
  },
  {
    id: 'priv-2',
    category: 'Privacy & Security',
    question: 'Does MatchWise AI store my resume?',
    answer:
      'Uploaded PDF files are processed in server memory during parsing. Generated resume outputs and analysis reports are securely linked to your account in our database so you can access your history anytime.',
  },
  {
    id: 'acc-1',
    category: 'Account',
    question: 'How do I create an account?',
    answer:
      'Click "Sign in" or "Get Started Free" in the navigation bar, select "Create Account", enter your name, email, and password, and you are ready to begin analyzing resumes.',
  },
  {
    id: 'acc-2',
    category: 'Account',
    question: 'What should I do if I cannot log in?',
    answer:
      'Check that your email address and password are entered correctly. If you experience persistent login issues, contact our support team at helpline 8153875076 or via Instagram @ivaibhavora.',
  },
  {
    id: 'sup-1',
    category: 'Support',
    question: 'How can I contact MatchWise AI?',
    answer:
      'You can reach our official support helpline directly at 8153875076 or message us on Instagram @ivaibhavora.',
  },
]

const CATEGORIES = ['All', 'General', 'Resume', 'Job Matching', 'Interview', 'Privacy & Security', 'Account', 'Support']

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const toggleAccordion = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <PageTransition>
      <SEO
        title="MatchWise AI — Frequently Asked Questions (FAQ)"
        description="Find answers to common questions about MatchWise AI resume analysis, ATS compatibility scoring, job matching logic, and interview preparation."
        canonical="https://matchwiseai.com/faq"
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
        <div className="container" style={{ maxWidth: '920px', margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
              Help & Answers
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
              Frequently Asked Questions
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
              Have questions about MatchWise AI? Find clear answers regarding our resume analyzer, job match score, interview report, and account security.
            </p>
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: '32px', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQ by keyword (e.g. PDF, match score, privacy)..."
                aria-label="Search FAQ questions"
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '14px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  background: '#ffffff',
                  fontSize: '0.95rem',
                  color: '#18181b',
                  outline: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '16px',
              marginBottom: '32px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    border: active ? '1px solid #d97706' : '1px solid rgba(0, 0, 0, 0.08)',
                    background: active ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#ffffff',
                    color: active ? '#08090d' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 2px 10px rgba(245, 158, 11, 0.3)' : 'none',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* FAQ Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '56px' }}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = expandedId === faq.id
                return (
                  <div
                    key={faq.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: isOpen ? '1px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.2)',
                      boxShadow: isOpen ? '0 4px 20px rgba(245, 158, 11, 0.12)' : '0 2px 10px rgba(0,0,0,0.02)',
                      overflow: 'hidden',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <button
                      id={`faq-btn-${faq.id}`}
                      aria-controls={`faq-panel-${faq.id}`}
                      aria-expanded={isOpen}
                      onClick={() => toggleAccordion(faq.id)}
                      style={{
                        width: '100%',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        outline: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#d97706',
                            background: 'rgba(245, 158, 11, 0.12)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            flexShrink: 0,
                          }}
                        >
                          {faq.category}
                        </span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181b', lineHeight: 1.4 }}>
                          {faq.question}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        style={{ flexShrink: 0, color: isOpen ? '#d97706' : '#94a3b8' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-panel-${faq.id}`}
                          role="region"
                          aria-labelledby={`faq-btn-${faq.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            style={{
                              padding: '0 24px 24px 24px',
                              color: '#475569',
                              fontSize: '0.95rem',
                              lineHeight: 1.7,
                              borderTop: '1px solid rgba(0,0,0,0.04)',
                              paddingTop: '16px',
                            }}
                          >
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  color: '#64748b',
                }}
              >
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>No questions found</p>
                <p style={{ fontSize: '0.9rem' }}>Try refining your search query or selecting another category.</p>
              </div>
            )}
          </div>

          {/* Bottom Support Callout Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
              borderRadius: '20px',
              padding: 'clamp(28px, 4vw, 40px)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
                Still have questions?
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.925rem', maxWidth: '480px' }}>
                Our support team is ready to help you optimize your resume and navigate your job application journey.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <a
                href="tel:8153875076"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#08090d',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                📞 Call 8153875076
              </a>
              <Link
                to="/contact"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  )
}

export default FAQ
