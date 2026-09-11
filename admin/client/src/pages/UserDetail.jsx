import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  Activity,
  MessageSquareQuote,
  AlertCircle,
  Eye,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  Zap,
} from 'lucide-react'
import {
  getUserDetail,
  updateUserRole,
  updateUserStatus,
} from '../services/user.api'
import { getUserActivities } from '../services/activity.api'
import { useToast } from '../components/ui/Toast'
import StatusBadge from '../components/ui/StatusBadge'
import RatingStars from '../components/ui/RatingStars'
import ActivityBadge, { formatTimeAgo } from '../components/ui/ActivityBadge'
import ConfirmModal from '../components/ui/ConfirmModal'
import Pagination from '../components/ui/Pagination'
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton'

export const UserDetail = () => {
  const { id } = useParams()
  const { toastSuccess, toastError } = useToast()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalAction, setModalAction] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Subsections / Tabs: 'activity' | 'feedback' | 'matching'
  const [activeTab, setActiveTab] = useState('activity')

  // User Activity Timeline state
  const [userActivities, setUserActivities] = useState([])
  const [activityPagination, setActivityPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 15 })
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [activityTypeFilter, setActivityTypeFilter] = useState('')

  const fetchUser = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUserDetail(id)
      if (data?.user) {
        setUser(data.user)
      }
    } catch (err) {
      console.error('[UserDetail] Fetch error:', err.message)
      toastError('Unable to load user details.')
    } finally {
      setLoading(false)
    }
  }, [id, toastError])

  const fetchActivities = useCallback(
    async (page = 1) => {
      setActivitiesLoading(true)
      try {
        const data = await getUserActivities(id, {
          page,
          limit: 15,
          eventType: activityTypeFilter,
        })
        if (data) {
          setUserActivities(data.activities || [])
          setActivityPagination(data.pagination || { page, totalPages: 1, total: 0, limit: 15 })
        }
      } catch (err) {
        console.warn('[UserDetail] Activities fetch error:', err.message)
      } finally {
        setActivitiesLoading(false)
      }
    },
    [id, activityTypeFilter],
  )

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (activeTab === 'activity' || activeTab === 'matching') {
      fetchActivities(activityPagination.page)
    }
  }, [activeTab, activityPagination.page, fetchActivities])

  const handleActionConfirm = async () => {
    if (!modalAction) return
    setIsProcessing(true)

    try {
      if (modalAction.type === 'status') {
        const data = await updateUserStatus(id, modalAction.targetValue)
        setUser((prev) => ({ ...prev, ...data.user }))
        toastSuccess(
          `User account ${modalAction.targetValue ? 'activated' : 'deactivated'}.`,
        )
      } else if (modalAction.type === 'role') {
        const data = await updateUserRole(id, modalAction.targetValue)
        setUser((prev) => ({ ...prev, ...data.user }))
        toastSuccess(`Role changed to '${modalAction.targetValue}'.`)
      }
      setModalAction(null)
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update user.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle size={40} className="text-rose-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">User Not Found</h3>
        <p className="text-sm text-slate-400">
          The requested user account was not found in the database.
        </p>
        <Link
          to="/users"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to User Directory
        </Link>
      </div>
    )
  }

  const matchingActivities = (user.recentActivities || []).filter((a) =>
    [
      'MATCH_SEARCHED',
      'MATCH_VIEWED',
      'MATCH_ACCEPTED',
      'MATCH_REJECTED',
      'RESUME_ANALYZED',
      'INTERVIEW_REPORT_GENERATED',
    ].includes(a.eventType),
  )

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <Link
            to="/users"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{user.username}</span>
              <StatusBadge status={user.role} />
              <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              User ID: <span className="font-mono text-slate-400">{user.id}</span>
            </p>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() =>
              setModalAction({
                type: 'status',
                targetValue: !user.isActive,
              })
            }
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              user.isActive
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {user.isActive ? 'Deactivate Account' : 'Activate Account'}
          </button>

          <button
            type="button"
            onClick={() =>
              setModalAction({
                type: 'role',
                targetValue: user.role === 'admin' ? 'user' : 'admin',
              })
            }
            className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Summary Card (1 Col) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-2xl font-black flex items-center justify-center shadow-lg">
              {user.username[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{user.username}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                <Mail size={13} />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/60 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Account Role
              </label>
              <StatusBadge status={user.role} size="sm" />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Account Status
              </label>
              <StatusBadge status={user.isActive ? 'active' : 'inactive'} size="sm" />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Registered Date
              </label>
              <p className="text-slate-200">
                {new Date(user.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Last Login
              </label>
              <p className="text-slate-200">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never logged in'}
              </p>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/60">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Logins</p>
                <p className="text-lg font-extrabold text-white mt-1">{user.loginCount || 0}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Feedbacks</p>
                <p className="text-lg font-extrabold text-emerald-400 mt-1">
                  {user.feedbackCount || 0}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Events</p>
                <p className="text-lg font-extrabold text-blue-400 mt-1">
                  {user.activityCount || 0}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">AI / Matches</p>
                <p className="text-lg font-extrabold text-purple-400 mt-1">
                  {user.matchActivityCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Activity / Feedback / Matching Dashboard (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity size={15} />
              <span>Activity Timeline ({user.activityCount || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquareQuote size={15} />
              <span>Feedback History ({user.feedbackCount || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matching')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matching'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles size={15} />
              <span>AI & Matching ({user.matchActivityCount || 0})</span>
            </button>
          </div>

          {/* TAB 1: Activity Timeline */}
          {activeTab === 'activity' && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Activity size={18} className="text-emerald-400" />
                    <span>Chronological User Activity</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Complete telemetry record of actions performed by this user.
                  </p>
                </div>
              </div>

              {activitiesLoading ? (
                <TableSkeleton rows={5} cols={3} />
              ) : userActivities.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No activity records logged for this user yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {userActivities.map((a) => (
                    <div
                      key={a.id}
                      className="py-3.5 flex items-start justify-between gap-4 text-xs hover:bg-slate-800/20 px-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ActivityBadge eventType={a.eventType} size="sm" />
                          <span className="text-[11px] text-slate-400">
                            {formatTimeAgo(a.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-200 font-medium leading-relaxed">
                          {a.description}
                        </p>
                        {a.metadata && Object.keys(a.metadata).length > 0 && (
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {Object.entries(a.metadata).slice(0, 3).map(([k, v]) => (
                              <span
                                key={k}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400"
                              >
                                <span>{k}:</span>
                                <span className="text-emerald-300 font-bold">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-[11px] text-slate-400 shrink-0">
                        {new Date(a.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Pagination */}
              {activityPagination.totalPages > 1 && (
                <div className="pt-3 border-t border-slate-800/60">
                  <Pagination
                    pagination={activityPagination}
                    onPageChange={(page) => fetchActivities(page)}
                    loading={activitiesLoading}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: User Feedback */}
          {activeTab === 'feedback' && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <MessageSquareQuote size={18} className="text-emerald-400" />
                    <span>Feedback Submissions</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reviews and feedback tickets submitted by this user.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {user.feedbackCount || 0} total
                </span>
              </div>

              {(!user.recentFeedback || user.recentFeedback.length === 0) ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  This user has not submitted any feedback yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {user.recentFeedback.map((f) => (
                    <div
                      key={f.id}
                      className="py-4 flex items-start justify-between gap-4 text-xs hover:bg-slate-800/20 px-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <StatusBadge status={f.status} size="sm" />
                          <RatingStars rating={f.rating} size={13} />
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                            {f.type?.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(f.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-200 leading-relaxed font-normal">
                          {f.message}
                        </p>
                      </div>

                      <Link
                        to={`/feedback/${f.id}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors shrink-0"
                        title="Inspect Feedback"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI & Match Activity */}
          {activeTab === 'matching' && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-400" />
                    <span>AI Analysis & Job Matching Records</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ATS resume generations, interview preparations, and job matches.
                  </p>
                </div>
              </div>

              {matchingActivities.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No AI or job matching actions recorded for this user yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {matchingActivities.map((a) => (
                    <div
                      key={a.id}
                      className="py-3.5 flex items-start justify-between gap-4 text-xs hover:bg-slate-800/20 px-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ActivityBadge eventType={a.eventType} size="sm" />
                          <span className="text-[11px] text-slate-400">
                            {formatTimeAgo(a.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-200 font-medium leading-relaxed">
                          {a.description}
                        </p>
                        {a.metadata && Object.keys(a.metadata).length > 0 && (
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {Object.entries(a.metadata).map(([k, v]) => (
                              <span
                                key={k}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400"
                              >
                                <span>{k}:</span>
                                <span className="text-purple-300 font-bold">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-[11px] text-slate-400 shrink-0">
                        {new Date(a.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(modalAction)}
        title={
          modalAction?.type === 'status'
            ? modalAction?.targetValue
              ? `Activate User Account`
              : `Deactivate User Account`
            : `Change User Role`
        }
        message={
          modalAction?.type === 'status'
            ? `Are you sure you want to ${
                modalAction?.targetValue ? 'activate' : 'deactivate'
              } account for "${user.username}"?`
            : `Are you sure you want to change role for "${user.username}" to "${modalAction?.targetValue}"?`
        }
        confirmText="Confirm Change"
        isDestructive={modalAction?.type === 'status' && !modalAction?.targetValue}
        isLoading={isProcessing}
        onConfirm={handleActionConfirm}
        onCancel={() => setModalAction(null)}
      />
    </div>
  )
}

export default UserDetail
