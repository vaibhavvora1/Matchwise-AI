import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  MessageSquareQuote,
  Star,
  Clock,
  Bug,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react'
import { getDashboardStats } from '../services/dashboard.api'
import { updateFeedbackStatus } from '../services/feedback.api'
import { useSocket } from '../context/SocketContext'
import { useToast } from '../components/ui/Toast'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import RatingStars from '../components/ui/RatingStars'
import ActivityBadge, { formatTimeAgo } from '../components/ui/ActivityBadge'
import { Skeleton } from '../components/ui/Skeleton'

export const Dashboard = () => {
  const { lastEvent } = useSocket()
  const { toastSuccess, toastError } = useToast()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionBusyId, setActionBusyId] = useState(null)

  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    else setRefreshing(true)

    try {
      const data = await getDashboardStats()
      if (data?.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('[Dashboard] Stats fetch error:', err.message)
      if (!isSilent) {
        toastError('Unable to fetch live dashboard statistics.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toastError])

  // Initial load + 30-second background polling fallback
  useEffect(() => {
    fetchStats()

    const interval = setInterval(() => {
      fetchStats(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchStats])

  // Trigger immediate refresh when a real-time event is received via Socket.IO
  useEffect(() => {
    if (lastEvent) {
      fetchStats(true)
    }
  }, [lastEvent, fetchStats])

  const handleQuickStatusUpdate = async (id, status) => {
    setActionBusyId(id)
    try {
      await updateFeedbackStatus(id, status)
      toastSuccess(`Feedback status changed to ${status}.`)
      await fetchStats(true)
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update feedback status.')
    } finally {
      setActionBusyId(null)
    }
  }

  if (loading && !stats) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  const { users, feedback, breakdowns, recentFeedback, recentUsers, recentActivities, activities } = stats || {
    users: {},
    feedback: {},
    breakdowns: { ratings: {}, types: {} },
    recentFeedback: [],
    recentUsers: [],
    recentActivities: [],
    activities: {},
  }

  const totalReviewsCount = feedback.total || 1

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Real-time analytics and user telemetry directly computed from your MongoDB database.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Users"
          value={users.total ?? 0}
          subtitle={`${users.active ?? 0} active accounts`}
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Total Feedback Submissions"
          value={feedback.total ?? 0}
          subtitle={`${feedback.today ?? 0} received today`}
          icon={MessageSquareQuote}
          color="emerald"
        />

        <StatCard
          title="Average Rating"
          value={feedback.averageRating ? `${feedback.averageRating} / 5` : '0.0 / 5'}
          subtitle={`${feedback.fiveStar ?? 0} five-star ratings`}
          icon={Star}
          color="amber"
        />

        <StatCard
          title="Activities Today"
          value={activities?.today ?? 0}
          subtitle={`${feedback.pending ?? 0} pending moderations`}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Live User Activity Stream Section */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" />
              <span>Recent Live User Activity</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live Feed
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Real-time feed of registrations, logins, AI resumes, job matches, and reviews.
            </p>
          </div>

          <Link
            to="/activity"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View Full Activity Stream</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {(!recentActivities || recentActivities.length === 0) ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No live user telemetry recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {recentActivities.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 shadow-md">
                  {a.user?.username?.[0]?.toUpperCase() || 'U'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    {a.user ? (
                      <Link
                        to={`/users/${a.user.id}`}
                        className="font-bold text-xs text-white hover:text-emerald-400 truncate block transition-colors"
                      >
                        {a.user.username}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Anonymous</span>
                    )}
                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                      {formatTimeAgo(a.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 font-medium">
                    {a.description}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <ActivityBadge eventType={a.eventType} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Section: Moderation Queue & Rating Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Feedback Moderation Table (2 Columns wide) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Recent Feedback Submissions</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect and moderate incoming feedback submissions in real-time.
                </p>
              </div>

              <Link
                to="/feedback"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>View All Feedback</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentFeedback.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No feedback records found in database yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {recentFeedback.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/20 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <StatusBadge status={item.status} size="sm" />
                        <RatingStars rating={item.rating} size={13} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {item.type?.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed break-words">
                        {item.message}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                        {item.user ? (
                          <Link
                            to={`/users/${item.user.id}`}
                            className="text-white hover:text-emerald-400 font-semibold transition-colors"
                          >
                            {item.user.username}
                          </Link>
                        ) : (
                          <span>Anonymous User</span>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Quick moderation buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        disabled={actionBusyId === item.id}
                        onClick={() => handleQuickStatusUpdate(item.id, 'approved')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                          item.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300'
                        } transition-colors cursor-pointer disabled:opacity-50`}
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionBusyId === item.id}
                        onClick={() => handleQuickStatusUpdate(item.id, 'rejected')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                          item.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300'
                        } transition-colors cursor-pointer disabled:opacity-50`}
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rating Breakdown & Type Distribution (1 Column wide) */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-1">
              Rating Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Customer satisfaction breakdown
            </p>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = breakdowns.ratings?.[stars] || 0
                const percent = Math.round((count / totalReviewsCount) * 100)

                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-bold text-slate-300 flex items-center gap-1 shrink-0">
                      {stars} <Star size={12} className="text-amber-400 fill-amber-400" />
                    </span>

                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <span className="w-12 text-right font-medium text-slate-400 shrink-0">
                      {count} ({percent}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white tracking-tight">
                Recent Users
              </h4>
              <Link
                to="/users"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentUsers.slice(0, 4).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {u.username[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/users/${u.id}`}
                        className="font-bold text-slate-200 hover:text-emerald-400 truncate block transition-colors"
                      >
                        {u.username}
                      </Link>
                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 shrink-0">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
