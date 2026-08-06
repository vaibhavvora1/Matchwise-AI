import  { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGSAPReveal } from '../../../hooks/useGSAPReveal'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import PageTransition from '../../../components/ui/PageTransition'
import TextPressure from '../../../components/ui/TextPressure'

/* ─── Product Walkthrough Capabilities ─── */
const PRODUCT_FEATURES = [
  {
    id: 'ats-check',
    badge: 'Step 1: Real-Time ATS Check',
    title: 'ATS Resume Checker & Keyword Matcher',
    subtitle: 'See exactly what ATS bots and recruiter screening filters see before you hit submit.',
    description: 'MatchWise AI cross-references your resume against the target job description to compute an instant ATS compatibility score, pinpoints missing high-priority keywords, and flags formatting traps.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accentColor: '#d97706',
    previewVisual: (
      <div style={{ background: '#ffffff', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>ATS Compatibility Score</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>94%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981)', borderRadius: '999px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.08)', padding: '8px 12px', borderRadius: '8px', color: '#047857', fontWeight: 600 }}>
            <span>✓ Matched: System Architecture, CI/CD, React</span>
            <span>High Priority</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(245, 158, 11, 0.08)', padding: '8px 12px', borderRadius: '8px', color: '#b45309', fontWeight: 600 }}>
            <span>+ Added: Kubernetes, Technical Mentorship</span>
            <span>Keyword Gap</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'resume-optimizer',
    badge: 'Step 2: Bullet Re-Engineering',
    title: 'AI Resume Builder & Content Optimizer',
    subtitle: 'Transform weak, passive bullet points into high-impact metric statements.',
    description: 'Our AI analyzes your experience to rewrite bullet points with strong action verbs, quantified business outcomes, and tailored industry phrasing that catches recruiters\' eyes.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accentColor: '#f43f5e',
    previewVisual: (
      <div style={{ background: '#ffffff', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Bullet Optimization Comparison
        </div>
        <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '10px', fontSize: '0.9rem', color: '#991b1b', marginBottom: '10px', textDecoration: 'line-through' }}>
          "Worked on improving frontend app performance and bugs."
        </div>
        <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '10px', fontSize: '0.92rem', color: '#166534', fontWeight: 600 }}>
          "Architected React component caching strategy, reducing initial page load by 42% for 120k active users."
        </div>
      </div>
    ),
  },
  {
    id: 'mock-interview',
    badge: 'Step 3: AI Mock Interview',
    title: 'Interactive AI Mock Interview Coach',
    subtitle: 'Practice technical & behavioral questions generated directly from the job posting.',
    description: 'Walk into your interview loop knowing the exact question patterns you will face. Get instant AI feedback on your answers, STAR-framework suggestions, and confidence ratings.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accentColor: '#d97706',
    previewVisual: (
      <div style={{ background: '#18181b', borderRadius: '20px', padding: '24px', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          ★ Role-Specific Predicted Prompt
        </div>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '14px' }}>
          "How did you handle system trade-offs when scaling your backend under strict latency limits?"
        </p>
        <div style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', padding: '8px 12px', borderRadius: '8px', color: '#10b981', fontWeight: 600 }}>
          ✓ Framework Suggestion: Focus on metric baseline → trade-off decision → measured outcome
        </div>
      </div>
    ),
  },
  {
    id: 'skill-roadmap',
    badge: 'Step 4: Skill Action Plan',
    title: '7-Day Skill Gap & Action Roadmap',
    subtitle: 'Turn missing job requirements into an actionable learning plan.',
    description: 'Instead of feeling underqualified when reading job descriptions, MatchWise AI categorizes skill gaps by severity and creates a practical 7-day plan to bridge them quickly.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accentColor: '#fbbf24',
    previewVisual: (
      <div style={{ background: '#ffffff', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          7-Day Skill Action Plan
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>1</span>
            <span>Day 1-2: Refresh Docker containerization patterns</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>2</span>
            <span>Day 3-5: Build a mini microservice deployment project</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>3</span>
            <span>Day 6-7: Add key metrics & project link to resume</span>
          </div>
        </div>
      </div>
    ),
  },
]

/* ─── Outcome Stats ─── */
const STATS = [
  { value: '88%', label: 'Less Job Search Anxiety' },
  { value: '3.2×', label: 'More Interview Callbacks' },
  { value: '94%', label: 'ATS Clearance Rate' },
  { value: '< 30s', label: 'Analysis & Prep Time' },
]

/* ─── Simple 3-Step Pathway ─── */
const STEPS = [
  {
    number: '01',
    title: 'Paste Resume & Job Requirements',
    description: 'Upload your current PDF resume alongside the target job posting you really want.',
  },
  {
    number: '02',
    title: 'AI Uncovers ATS & Interview Gaps',
    description: 'Get an immediate breakdown of missing keywords, weak bullet points, and likely interview questions.',
  },
  {
    number: '03',
    title: 'Walk In Prepared & Get Hired',
    description: 'Apply with an ATS-optimized resume, ace the technical loop, and secure your next offer.',
  },
]

const Landing = () => {
  const walkthroughRef = useGSAPReveal({ stagger: 0.18, start: 'top 75%' })
  const stepsRef = useGSAPReveal({ stagger: 0.2, start: 'top 75%' })
  const statsRef = useGSAPReveal({ stagger: 0.1, start: 'top 80%' })
  const [activeTab, setActiveTab] = useState(0)

  return (
    <PageTransition>
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section
        style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          paddingTop: 'calc(var(--navbar-height, 88px) + 64px)',
          paddingBottom: '80px',
          background: 'linear-gradient(135deg, #fdfbf7 0%, #faf6ef 50%, #fffcf8 100%)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
        }}
      >
        {/* Ambient warm blurs */}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '-5%',
            width: '500px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(244, 63, 94, 0.04) 60%, transparent 80%)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 0.85fr',
              gap: '56px',
              alignItems: 'center',
            }}
          >
            {/* ─── Left Column ─── */}
            <div style={{ textAlign: 'left' }}>
              {/* Eyebrow Badge */}
              {/* Headline with Text Pressure Effect */}
              <div style={{ marginBottom: '26px' }}>
                <TextPressure
                  text="Turn job search anxiety into your next job offer."
                  accentColor="#d97706"
                  defaultColor="#18181b"
                  textAlign="left"
                />
              </div>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(1.05rem, 1.6vw, 1.2rem)',
                  color: '#475569',
                  maxWidth: '580px',
                  marginBottom: '36px',
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                The ghosting, the silent ATS rejections, the dread of freezing up in technical rounds.
                MatchWise AI optimizes your resume for ATS, surfaces perfectly matched job listings tailored to your skills, and prepares you for every interview question — so you walk out with an offer.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '32px',
                }}
              >
                <Link to="/analyze" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(251, 191, 36, 0.45)' }}
                    whileTap={{ scale: 0.97 }}
                    id="cta-optimize-resume"
                    style={{
                      background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%)',
                      color: '#78350f',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      padding: '16px 34px',
                      borderRadius: '999px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 6px 20px rgba(251, 191, 36, 0.35)',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Optimize My Resume Now
                  </motion.button>
                </Link>

                <Link to="/analyze" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.04, borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.08)' }}
                    whileTap={{ scale: 0.97 }}
                    id="cta-interview-prep"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#92400e',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      padding: '15px 30px',
                      borderRadius: '999px',
                      border: '1px solid rgba(251, 191, 36, 0.45)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Prepare for My Interview
                  </motion.button>
                </Link>
              </motion.div>

              {/* Job Matching Info Note */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.88rem',
                  color: '#92400e',
                  marginBottom: '16px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>
                  <strong>Job Matching also available</strong> — get a curated list of job postings that fit your resume and skills.
                </span>
              </motion.div>

              {/* Reassurance tags */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                  fontSize: '0.88rem',
                  color: '#64748b',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Free Instant ATS Analysis
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  No Credit Card Required
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Tailored Prep Report
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Smart Job Matching
                </span>
              </div>
            </div>

            {/* ─── Right Column ─── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ position: 'relative' }}
            >
              <div
                style={{
                  position: 'relative',
                  background: '#ffffff',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '28px',
                  padding: '32px',
                  boxShadow: '0 20px 45px -10px rgba(217, 119, 6, 0.12), 0 10px 25px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-sans)' }}>
                      MatchWise Readiness Score
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.12)', color: '#047857' }}>
                    Offer Ready
                  </span>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                    <span>ATS Keyword & Impact Score</span>
                    <span style={{ color: '#d97706', fontWeight: 800 }}>94%</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '94%' }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981)', borderRadius: '999px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fcfbf7', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.15)', fontSize: '0.9rem', color: '#1e293b' }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                    <span><strong>14 Critical Keywords Matched</strong> (System Architecture, CI/CD, Leadership)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fcfbf7', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.15)', fontSize: '0.9rem', color: '#1e293b' }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                    <span><strong>Bullet Metrics Re-engineered</strong> ("Increased throughput by 42%")</span>
                  </div>
                </div>

                <div style={{ background: '#18181b', borderRadius: '16px', padding: '18px 20px', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/></svg>
                    Predicted Interview Question
                  </div>
                  <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5, fontFamily: 'var(--font-serif)', fontStyle: 'italic', margin: 0 }}>
                    "How did you resolve performance bottlenecks when migrating microservices under high traffic?"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <style>{`
          @media (max-width: 960px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
          }
        `}</style>
      </section>

      {/* ─── Outcome Stats ─── */}
      <section
        style={{
          background: '#f7f3ea',
          borderTop: '1px solid rgba(245, 158, 11, 0.15)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
          position: 'relative',
        }}
      >
        <div
          ref={statsRef}
          className="container stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0',
            padding: '40px 24px',
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              data-reveal
              className="stats-cell"
              style={{
                textAlign: 'center',
                padding: '16px 20px',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
                  fontWeight: 700,
                  color: '#d97706',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.92rem', color: '#475569', marginTop: '6px', fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 720px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; row-gap: 28px !important; }
            .stats-cell:nth-child(2) { border-right: none !important; }
          }
        `}</style>
      </section>

      {/* ─── Deep Product Walkthrough Section ─── */}
      <section id="features" style={{ paddingTop: '110px', paddingBottom: '110px', background: '#fdfbf7' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#d97706',
                marginBottom: '12px',
              }}
            >
              PRODUCT WALKTHROUGH
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#18181b',
                marginBottom: '18px',
                lineHeight: 1.15,
              }}
            >
              What MatchWise AI actually does for your job hunt.
            </h2>
            <p style={{ color: '#475569', fontSize: 'clamp(1rem, 1.3vw, 1.15rem)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
              No vague promises or fake profiles. Here is the exact 4-step intelligence suite that turns your application into an interview callback.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div
            className="feature-tabs"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '48px',
            }}
          >
            {PRODUCT_FEATURES.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(index)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '999px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  border: activeTab === index ? '1px solid #d97706' : '1px solid rgba(0, 0, 0, 0.08)',
                  background: activeTab === index ? 'rgba(245, 158, 11, 0.15)' : '#ffffff',
                  color: activeTab === index ? '#b45309' : '#475569',
                  boxShadow: activeTab === index ? '0 4px 14px rgba(245, 158, 11, 0.2)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                {item.title.split('&')[0]}
              </button>
            ))}
          </div>

          {/* Feature Grid Cards */}
          <div
            ref={walkthroughRef}
            className="walkthrough-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '32px',
            }}
          >
            {PRODUCT_FEATURES.map((f, i) => (
              <motion.div
                key={f.id}
                data-reveal
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{
                  background: '#ffffff',
                  border: activeTab === i ? '2px solid #d97706' : '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '24px',
                  padding: '36px',
                  boxShadow: '0 12px 35px -8px rgba(0, 0, 0, 0.06), 0 0 20px rgba(245, 158, 11, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: f.accentColor,
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      marginBottom: '20px',
                    }}
                  >
                    {f.badge}
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 700,
                      fontSize: 'clamp(1.3rem, 1.8vw, 1.55rem)',
                      color: '#18181b',
                      marginBottom: '8px',
                      lineHeight: 1.25,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: '#d97706', fontSize: '0.96rem', fontWeight: 600, marginBottom: '14px' }}>
                    {f.subtitle}
                  </p>

                  <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: 1.65, marginBottom: '24px' }}>
                    {f.description}
                  </p>
                </div>

                <div style={{ marginTop: '16px' }}>
                  {f.previewVisual}
                </div>
              </motion.div>
            ))}
          </div>

          <style>{`
            @media (max-width: 860px) {
              .walkthrough-grid { grid-template-columns: 1fr !important; }
              .feature-tabs { justify-content: flex-start !important; overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 4px; }
            }
          `}</style>
        </div>
      </section>

      {/* ─── 3-Step Pathway Section ─── */}
      <section
        id="how-it-works"
        style={{
          paddingTop: '110px',
          paddingBottom: '110px',
          background: '#f7f3ea',
          borderTop: '1px solid rgba(245, 158, 11, 0.15)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#d97706',
                marginBottom: '12px',
              }}
            >
              The Path to Hired
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#18181b',
                lineHeight: 1.15,
              }}
            >
              Three steps from application to offer.
            </h2>
          </div>

          <div
            ref={stepsRef}
            className="steps-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '36px',
              position: 'relative',
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={i}
                data-reveal
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  background: '#ffffff',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '24px',
                  padding: '40px 28px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#08090d',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    marginBottom: '24px',
                    boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  {step.number}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    color: '#18181b',
                    marginBottom: '12px',
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: 1.65 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <style>{`
            @media (max-width: 860px) {
              .steps-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>

          {/* Section CTA */}
          <div style={{ textAlign: 'center', marginTop: '64px' }}>
            <Link to="/analyze" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(245, 158, 11, 0.45)' }}
                whileTap={{ scale: 0.97 }}
                id="cta-start-now"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#08090d',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  padding: '16px 36px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
                }}
              >
                Get Started Free — Analyze Your Resume
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="#08090d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Closing Outcome Banner ─── */}
      <section
        style={{
          paddingTop: '90px',
          paddingBottom: '90px',
          background: 'linear-gradient(135deg, #fdfbf7 0%, #f7f2ea 100%)',
          borderTop: '1px solid rgba(245, 158, 11, 0.2)',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              fontWeight: 700,
              color: '#18181b',
              marginBottom: '20px',
              lineHeight: 1.15,
            }}
          >
            Ready to stop guessing and get closer to your next offer?
          </h2>
          <p
            style={{
              color: '#475569',
              fontSize: 'clamp(1.02rem, 1.6vw, 1.2rem)',
              marginBottom: '36px',
              lineHeight: 1.6,
            }}
          >
            Upload your resume now and transform your application in less than 30 seconds.
          </p>

          <Link to="/analyze" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 35px rgba(245, 158, 11, 0.5)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#08090d',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '1.1rem',
                padding: '18px 42px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)',
              }}
            >
              Build My ATS Resume & Interview Plan
            </motion.button>
          </Link>
        </div>
      </section>

      <Footer />
    </PageTransition>
  )
}

export default Landing