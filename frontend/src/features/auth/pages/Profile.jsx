import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/userAuth'
import { getUserHistory, getHistoryItem, deleteHistoryItem } from '../services/history.api'
import { useToast } from '../../../components/ui/Toast.jsx'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import { handleDownloadPDF } from '../../ai/utils/resumePdf'
import { handleDownloadInterviewReportPDF } from '../../ai/utils/interviewReportPdf'
import { normalizeAtsData } from '../../ai/utils/normalizeAtsData'
import SEO from '../../../components/ui/SEO'

/* ─── Helpers ─── */
const fmt = (date) =>
  date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const fmtTime = (date) =>
  date ? new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'

const scoreColor = (s) => (s >= 71 ? '#15803d' : s >= 41 ? '#b45309' : '#dc2626')
const scoreBg    = (s) => (s >= 71 ? 'rgba(16,185,129,0.1)' : s >= 41 ? 'rgba(251,191,36,0.15)' : 'rgba(220,38,38,0.08)')
const scoreBorder= (s) => (s >= 71 ? 'rgba(16,185,129,0.25)' : s >= 41 ? 'rgba(251,191,36,0.35)' : 'rgba(220,38,38,0.2)')
const scoreLabel = (s) => (s >= 71 ? 'Excellent' : s >= 41 ? 'Good' : 'Low')

/* ─── Card wrapper shared style ─── */
const card = {
  background: '#ffffff',
  border: '1px solid rgba(245,158,11,0.18)',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(217,119,6,0.07), 0 1px 6px rgba(0,0,0,0.04)',
}

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value }) => (
  <div style={{
    ...card,
    padding: '22px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  }}>
    <div style={{
      width: '46px', height: '46px',
      background: 'rgba(251,191,36,0.12)',
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#d97706', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181b', lineHeight: 1, fontFamily: 'var(--font-sans)' }}>{value}</p>
      <p style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>{label}</p>
    </div>
  </div>
)

/* ─── Score Badge ─── */
const ScoreBadge = ({ score }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: scoreBg(score),
    color: scoreColor(score),
    border: `1px solid ${scoreBorder(score)}`,
    borderRadius: '9999px',
    padding: '3px 10px',
    fontSize: '0.78rem',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
  }}>
    {score}% · {scoreLabel(score)}
  </span>
)

/* ─── Type Badge ─── */
const TypeBadge = ({ type }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    background: type === 'ats_resume'
      ? 'rgba(251,191,36,0.12)'
      : 'rgba(16,185,129,0.1)',
    color: type === 'ats_resume' ? '#92400e' : '#065f46',
    border: `1px solid ${type === 'ats_resume' ? 'rgba(251,191,36,0.3)' : 'rgba(16,185,129,0.25)'}`,
    borderRadius: '9999px',
    padding: '3px 10px',
    fontSize: '0.73rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    fontFamily: 'var(--font-sans)',
  }}>
    {type === 'ats_resume' ? 'ATS Resume' : 'Interview Report'}
  </span>
)

/* ─── Loading Skeleton ─── */
const SkeletonRow = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {[1,2,3].map(i => (
      <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'linear-gradient(90deg,#faf6ef 25%,#f5eddf 50%,#faf6ef 75%)', backgroundSize: '1000px 100%', animation: 'shimmer 2s infinite linear' }} />
    ))}
  </div>
)

/* ─── Report Modal ─── */
const ReportModal = ({ item, onClose }) => {
  if (!item) return null
  const report = item.reportData

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(24,24,27,0.55)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', backdropFilter: 'blur(4px)',
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fffcf8',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '20px',
            maxWidth: '640px', width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 24px 64px rgba(217,119,6,0.15), 0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Modal Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(245,158,11,0.15)',
            position: 'sticky', top: 0,
            background: '#fffcf8',
            zIndex: 1,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <TypeBadge type={item.type} />
                {typeof item.matchScore === 'number' && <ScoreBadge score={item.matchScore} />}
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#18181b', fontFamily: 'var(--font-sans)' }}>
                {item.resumeName || 'Resume Analysis'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>
                {item.jobTitle} · {fmt(item.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                cursor: 'pointer',
                borderRadius: '10px',
                padding: '8px',
                color: '#92400e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '24px' }}>
            {item.type === 'interview_report' && report ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {report.summary && (
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#18181b', marginBottom: '6px', fontFamily: 'var(--font-sans)' }}>Summary</p>
                    <p style={{ fontSize: '0.875rem', color: '#57534e', lineHeight: 1.7, fontFamily: 'var(--font-sans)' }}>{report.summary}</p>
                  </div>
                )}
                {Array.isArray(report.skillsGaps) && report.skillsGaps.length > 0 && (
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#18181b', marginBottom: '10px', fontFamily: 'var(--font-sans)' }}>Skill Gaps</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {report.skillsGaps.slice(0, 6).map((gap, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#faf6ef', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.12)' }}>
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                            background: gap.severity === 'high' ? '#ef4444' : gap.severity === 'medium' ? '#f59e0b' : '#22c55e'
                          }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#292524', fontFamily: 'var(--font-sans)' }}>{gap.skill}</span>
                          <span style={{ fontSize: '0.75rem', color: '#a8a29e', marginLeft: 'auto', fontFamily: 'var(--font-sans)' }}>{gap.severity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : item.type === 'ats_resume' && report ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {report.resume?.summary && (
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#18181b', marginBottom: '6px', fontFamily: 'var(--font-sans)' }}>Professional Summary</p>
                    <p style={{ fontSize: '0.875rem', color: '#57534e', lineHeight: 1.7, fontFamily: 'var(--font-sans)' }}>{report.resume.summary}</p>
                  </div>
                )}
                {Array.isArray(report.atsReport?.keywordsMatched) && (
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#18181b', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>Keywords Matched</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {report.atsReport.keywordsMatched.map((kw, i) => (
                        <span key={i} style={{ background: 'rgba(16,185,129,0.1)', color: '#065f46', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '9999px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#a8a29e', fontSize: '0.9rem', fontFamily: 'var(--font-sans)' }}>No report data available.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Main Component ─── */
const ProfilePage = () => {
  const { user, loading: authLoading, handleGetUserProfile, handleLogout, handleLogoutAllDevices } = useAuth()
  const navigate = useNavigate()
  const { toastSuccess, toastError } = useToast()

  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [isPaginating, setIsPaginating] = useState(false)   // true only on page-turn, not first load
  const [historyError, setHistoryError] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [totalAts, setTotalAts]       = useState(0)         // stable totals from server
  const [totalReports, setTotalReports] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [modalItem, setModalItem] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)
  const historyRef = useRef(null)   // used to scroll history card into view on pagination

  useEffect(() => {
    handleGetUserProfile().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchHistory = useCallback(async (page = 1, scrollToHistory = false) => {
    // For pagination: dim-in-place. For filter/search changes: full skeleton.
    if (page === 1) {
      setHistoryLoading(true)
      setIsPaginating(false)
    } else {
      setIsPaginating(true)
    }
    setHistoryError('')
    try {
      const data = await getUserHistory({ page, limit: 8, search, type: typeFilter })
      setHistory(data.history || [])
      const pg = data.pagination || { page: 1, totalPages: 1, total: 0 }
      setPagination(pg)
      // Server may return atsCount / reportCount in metadata — fall back to client filter
      if (data.atsCount   != null) setTotalAts(data.atsCount)
      if (data.reportCount != null) setTotalReports(data.reportCount)
      // Scroll the history card into view on page turn (not on initial load)
      if (scrollToHistory && historyRef.current) {
        historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch {
      setHistoryError('Failed to load analysis history.')
    } finally {
      setHistoryLoading(false)
      setIsPaginating(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    if (user) fetchHistory(1)
  }, [user, search, typeFilter, fetchHistory])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteHistoryItem(id)
      setHistory(prev => prev.filter(h => h._id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
      toastSuccess('Analysis deleted successfully.')
    } catch {
      toastError('Failed to delete. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownloadItem = async (id, type, resumeName) => {
    setDownloadingId(id)
    try {
      const data = await getHistoryItem(id)
      const fullItem = data.item
      if (!fullItem || !fullItem.reportData) throw new Error('Report data not found')
      if (type === 'ats_resume') {
        const parsed = normalizeAtsData(fullItem.reportData)
        await handleDownloadPDF(parsed.resume)
      } else if (type === 'interview_report') {
        await handleDownloadInterviewReportPDF(
          fullItem.reportData,
          fullItem.jobTitle || 'Untitled Role',
          fullItem.resumeName || resumeName || 'Resume'
        )
      }
      toastSuccess('PDF downloaded successfully.')
    } catch (err) {
      console.error('[Profile] Download error:', err)
      toastError('Failed to download PDF. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleViewReport = async (id) => {
    setModalLoading(true)
    try {
      const data = await getHistoryItem(id)
      setModalItem(data.item)
    } catch {
      toastError('Failed to load report data.')
    } finally {
      setModalLoading(false)
    }
  }

  const handleLogoutClick = async () => {
    await handleLogout()
    toastSuccess('Logged out successfully.')
    navigate('/login')
  }

  const handleLogoutAllClick = async () => {
    await handleLogoutAllDevices()
    toastSuccess('Logged out from all devices.')
    navigate('/login')
  }

  const initial = user?.username?.charAt(0).toUpperCase() || 'U'
  // Memoised slices — recompute only when history array identity changes
  const recentHistory = useMemo(() => history.slice(0, 3), [history])
  const totalAnalyses  = pagination.total
  // Use server-provided totals when available; fall back to page-slice counts
  const atsCount     = totalAts   || history.filter(h => h.type === 'ats_resume').length
  const reportCount  = totalReports || history.filter(h => h.type === 'interview_report').length

  /* ── Shared button styles ── */
  const btnPrimary = {
    height: '42px', padding: '0 26px',
    background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%)',
    color: '#78350f',
    border: 'none', borderRadius: '999px',
    fontWeight: 700, fontSize: '0.875rem',
    cursor: 'pointer', fontFamily: 'var(--font-sans)',
    boxShadow: '0 4px 14px rgba(251,191,36,0.3)',
    display: 'inline-flex', alignItems: 'center', gap: '8px',
  }

  const btnGhost = {
    height: '38px', padding: '0 18px',
    background: '#fff',
    color: '#92400e',
    border: '1px solid rgba(251,191,36,0.4)',
    borderRadius: '999px',
    fontWeight: 600, fontSize: '0.8125rem',
    cursor: 'pointer', fontFamily: 'var(--font-sans)',
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    transition: 'all 0.2s ease',
  }

  const btnIcon = {
    height: '36px', width: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#fff',
    border: '1px solid rgba(251,191,36,0.35)',
    borderRadius: '10px', cursor: 'pointer', color: '#92400e',
  }

  const btnDanger = {
    height: '36px', width: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#fff5f5',
    border: '1px solid rgba(220,38,38,0.2)',
    borderRadius: '10px', cursor: 'pointer', color: '#dc2626',
  }

  return (
    <>
      <SEO
        title="MatchWise AI — Profile & History Dashboard"
        description="View your saved ATS resume analyses, interview prep reports, and account settings."
        noindex={true}
      />
      <Navbar />
      <main style={{
        paddingTop: '80px',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #fdfbf7 0%, #faf6ef 55%, #fffcf8 100%)',
      }}>
        {/* Ambient blurs */}
        <div style={{ position: 'fixed', top: '10%', right: '-8%', width: '420px', height: '380px', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '15%', left: '-5%', width: '350px', height: '320px', background: 'radial-gradient(circle, rgba(244,63,94,0.04) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>

          {/* ─── Page Header ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '36px' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: '999px', padding: '5px 14px', marginBottom: '14px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d97706', boxShadow: '0 0 7px #f59e0b' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b45309', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>
                MatchWise AI
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.4rem)',
              fontWeight: 800,
              color: '#18181b',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.2,
            }}>
              My Profile
            </h1>
            <p style={{ fontSize: '1rem', color: '#78716c', marginTop: '6px', fontFamily: 'var(--font-sans)' }}>
              Track your analyses, download reports, and manage your account.
            </p>
          </motion.div>

          {/* ─── Loading skeletons ─── */}
          {authLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: i === 1 ? '140px' : '100px', borderRadius: '20px', background: 'linear-gradient(90deg,#faf6ef 25%,#f5eddf 50%,#faf6ef 75%)', backgroundSize: '1000px 100%', animation: 'shimmer 2s infinite linear' }} />
              ))}
            </div>
          )}

          {/* ─── No user ─── */}
          {!authLoading && !user && (
            <div style={{ ...card, padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: '#18181b', fontFamily: 'var(--font-sans)' }}>No profile available</p>
              <p style={{ fontSize: '0.875rem', color: '#78716c', marginTop: '6px', fontFamily: 'var(--font-sans)' }}>Log in to see your account details.</p>
              <Link to="/login" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-flex', marginTop: '20px' }}>
                Go to Login
              </Link>
            </div>
          )}

          {/* ─── Main Content ─── */}
          {!authLoading && user && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {/* ─── Top row: User Info + Account Details ─── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="profile-top-grid">

                {/* User Identity Card */}
                <div style={{ ...card, padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                    {/* Avatar */}
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.75rem', fontWeight: 800, color: '#78350f',
                      boxShadow: '0 6px 20px rgba(245,158,11,0.3)',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}>
                          {user.username || 'User'}
                        </h2>
                        {/* Role Badge */}
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
                          background: user.role === 'admin' ? 'rgba(251,191,36,0.2)' : 'rgba(245,158,11,0.12)',
                          color: user.role === 'admin' ? '#92400e' : '#b45309',
                          border: '1px solid rgba(251,191,36,0.3)',
                          borderRadius: '9999px', padding: '2px 9px', textTransform: 'uppercase',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {user.role || 'user'}
                        </span>
                        {/* Status */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
                          color: user.isActive ? '#15803d' : '#78716c',
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.isActive ? '#22c55e' : '#d1d5db', boxShadow: user.isActive ? '0 0 6px #22c55e' : 'none' }} />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#78716c', marginTop: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Details Card */}
                <div style={{ ...card, padding: '28px' }}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b45309', marginBottom: '16px', fontFamily: 'var(--font-sans)' }}>
                    Account Details
                  </p>
                  <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                      { label: 'Member Since', value: fmt(user.createdAt) },
                      { label: 'Last Login',    value: fmtTime(user.lastLoginAt) },
                      { label: 'Total Logins',  value: user.loginCount != null ? `${user.loginCount}×` : '—' },
                      { label: 'Account Type',  value: user.role === 'admin' ? 'Administrator' : 'Standard' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <dt style={{ fontSize: '0.73rem', color: '#a8a29e', marginBottom: '3px', fontFamily: 'var(--font-sans)' }}>{label}</dt>
                        <dd style={{ fontSize: '0.875rem', fontWeight: 700, color: '#292524', fontFamily: 'var(--font-sans)' }}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* ─── Stats Row ─── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="profile-stats-grid">
                <StatCard
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  label="Total Analyses"
                  value={totalAnalyses}
                />
                <StatCard
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  label="ATS Resumes"
                  value={atsCount}
                />
                <StatCard
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  label="Interview Reports"
                  value={reportCount}
                />
              </div>

              {/* ─── Recent Analysis ─── */}
              <div style={{ ...card, padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#18181b', fontFamily: 'var(--font-sans)' }}>Recent Analysis</h2>
                    <p style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>Your 3 most recent AI analyses</p>
                  </div>
                  <Link to="/analyze" style={{ ...btnGhost, textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                    New Analysis
                  </Link>
                </div>

                {historyLoading && recentHistory.length === 0 ? (
                  <SkeletonRow />
                ) : recentHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 24px', border: '1.5px dashed rgba(245,158,11,0.25)', borderRadius: '14px', background: 'rgba(251,191,36,0.03)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px', color: '#d97706', opacity: 0.5 }}>
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p style={{ fontWeight: 700, color: '#292524', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)' }}>No analyses yet</p>
                    <p style={{ fontSize: '0.8125rem', color: '#a8a29e', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>Upload your resume and get AI-powered insights.</p>
                    <Link to="/analyze" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-flex', marginTop: '16px' }}>
                      Start Analyzing
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentHistory.map((item, i) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '16px',
                          padding: '14px 16px',
                          background: 'rgba(251,191,36,0.04)',
                          borderRadius: '12px',
                          border: '1px solid rgba(245,158,11,0.12)',
                        }}
                      >
                        {/* Type icon */}
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: item.type === 'ats_resume' ? 'rgba(251,191,36,0.12)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.type === 'ats_resume' ? '#d97706' : '#059669', flexShrink: 0 }}>
                          {item.type === 'ats_resume'
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          }
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}>
                            {item.resumeName || 'Resume'}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#a8a29e', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>
                            {item.jobTitle} · {fmt(item.createdAt)}
                          </p>
                        </div>
                        <ScoreBadge score={item.matchScore} />
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button onClick={() => handleViewReport(item._id)} style={btnGhost}>
                            {modalLoading ? '...' : 'View'}
                          </button>
                          <button
                            onClick={() => handleDownloadItem(item._id, item.type, item.resumeName)}
                            disabled={downloadingId === item._id}
                            style={btnIcon}
                            title="Download PDF"
                            aria-label="Download analysis PDF"
                          >
                            {downloadingId === item._id
                              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1.5s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="30 10" strokeLinecap="round"/></svg>
                              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            }
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── Analysis History ─── */}
              <div ref={historyRef} style={{ ...card, padding: '28px', scrollMarginTop: '96px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#18181b', fontFamily: 'var(--font-sans)' }}>Analysis History</h2>
                    <p style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>{pagination.total} total analyses</p>
                  </div>
                  {/* Inline pagination spinner */}
                  {isPaginating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#b45309', fontFamily: 'var(--font-sans)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="30 10" strokeLinecap="round"/>
                      </svg>
                      Loading…
                    </div>
                  )}
                </div>

                {/* Search + Filter row */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex', gap: '8px', minWidth: '200px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }}>
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by resume or job title…"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        style={{
                          width: '100%', paddingLeft: '34px', paddingRight: '12px',
                          height: '40px', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px',
                          fontSize: '0.875rem', color: '#292524', background: 'rgba(251,191,36,0.04)',
                          outline: 'none', fontFamily: 'var(--font-sans)',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <button type="submit" style={{ ...btnGhost, height: '40px' }}>
                      Search
                    </button>
                  </form>

                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    style={{
                      height: '40px', padding: '0 14px',
                      border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px',
                      fontSize: '0.875rem', color: '#292524',
                      background: 'rgba(251,191,36,0.04)',
                      cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="ats_resume">ATS Resume</option>
                    <option value="interview_report">Interview Report</option>
                  </select>
                </div>

                {/* Error */}
                {historyError && (
                  <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#b91c1c', fontSize: '0.875rem', marginBottom: '16px', fontFamily: 'var(--font-sans)' }}>
                    {historyError}
                  </div>
                )}

                {/* History list — skeleton on true first-load only; dims in-place during pagination */}
                {historyLoading && !isPaginating ? (
                  <SkeletonRow />
                ) : (
                  <div style={{ opacity: isPaginating ? 0.45 : 1, pointerEvents: isPaginating ? 'none' : 'auto', transition: 'opacity 0.2s ease' }}>
                    {history.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 24px', border: '1.5px dashed rgba(245,158,11,0.22)', borderRadius: '14px', background: 'rgba(251,191,36,0.03)' }}>
                        <p style={{ fontWeight: 700, color: '#292524', fontFamily: 'var(--font-sans)' }}>{search || typeFilter ? 'No results found' : 'No history yet'}</p>
                        <p style={{ fontSize: '0.8125rem', color: '#a8a29e', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                          {search || typeFilter ? 'Try different search terms or filters.' : 'Your analyses will appear here after you run them.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {history.map((item, i) => (
                          <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: isPaginating ? 0 : i * 0.04, duration: 0.25 }}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto auto auto',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '14px 16px',
                              background: 'rgba(251,191,36,0.04)',
                              borderRadius: '12px',
                              border: '1px solid rgba(245,158,11,0.1)',
                            }}
                            className="history-row"
                          >
                          {/* Info */}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <TypeBadge type={item.type} />
                              <ScoreBadge score={item.matchScore} />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}>
                              {item.resumeName || 'Resume'}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#a8a29e', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>
                              {item.jobTitle} · {fmt(item.createdAt)}
                            </p>
                            {Array.isArray(item.skills) && item.skills.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                {item.skills.slice(0, 5).map((s, j) => (
                                  <span key={j} style={{ background: 'rgba(245,158,11,0.1)', color: '#92400e', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '9999px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                                    {s}
                                  </span>
                                ))}
                                {item.skills.length > 5 && <span style={{ fontSize: '0.68rem', color: '#a8a29e', fontFamily: 'var(--font-sans)' }}>+{item.skills.length - 5}</span>}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <button
                            onClick={() => handleViewReport(item._id)}
                            disabled={modalLoading}
                            style={btnGhost}
                          >
                            View Report
                          </button>

                          <button
                            onClick={() => handleDownloadItem(item._id, item.type, item.resumeName)}
                            disabled={downloadingId === item._id}
                            style={btnIcon}
                            title="Download PDF"
                            aria-label="Download analysis PDF"
                          >
                            {downloadingId === item._id
                              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1.5s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="30 10" strokeLinecap="round"/></svg>
                              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            }
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            style={deletingId === item._id ? { ...btnDanger, opacity: 0.6, cursor: 'not-allowed' } : btnDanger}
                            title="Delete"
                            aria-label="Delete analysis"
                          >
                            {deletingId === item._id
                              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            }
                          </button>
                        </motion.div>
                        ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                            <button
                              disabled={!pagination.hasPrev || isPaginating}
                              onClick={() => fetchHistory(pagination.page - 1, true)}
                              style={{
                                ...btnGhost,
                                opacity: pagination.hasPrev && !isPaginating ? 1 : 0.4,
                                cursor: pagination.hasPrev && !isPaginating ? 'pointer' : 'default',
                              }}
                            >
                              ← Prev
                            </button>
                            <span style={{ fontSize: '0.8125rem', color: '#a8a29e', fontFamily: 'var(--font-sans)', minWidth: '90px', textAlign: 'center' }}>
                              Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                              disabled={!pagination.hasNext || isPaginating}
                              onClick={() => fetchHistory(pagination.page + 1, true)}
                              style={{
                                ...btnGhost,
                                opacity: pagination.hasNext && !isPaginating ? 1 : 0.4,
                                cursor: pagination.hasNext && !isPaginating ? 'pointer' : 'default',
                              }}
                            >
                              Next →
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ─── Actions ─── */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingBottom: '8px' }}>
                <button type="button" onClick={handleLogoutClick} style={btnPrimary}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Logout
                </button>
                <button
                  type="button"
                  onClick={handleLogoutAllClick}
                  style={{
                    height: '42px', padding: '0 26px',
                    background: '#fff',
                    color: '#dc2626',
                    border: '1px solid rgba(220,38,38,0.25)',
                    borderRadius: '999px',
                    fontWeight: 700, fontSize: '0.875rem',
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  Logout All Devices
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Report Modal */}
      {modalItem && <ReportModal item={modalItem} onClose={() => setModalItem(null)} />}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -1000px 0; }
          100% { background-position:  1000px 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .profile-top-grid   { grid-template-columns: 1fr !important; }
          .profile-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .history-row        { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .profile-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Footer />
    </>
  )
}

export default ProfilePage