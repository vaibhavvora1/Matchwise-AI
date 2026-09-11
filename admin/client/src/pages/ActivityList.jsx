import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Search,
  Filter,
  RotateCcw,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Radio,
  Sparkles,
  ExternalLink,
  Calendar,
  Layers,
  Users,
  Zap,
} from 'lucide-react'
import { getActivityList, getActivityStats } from '../services/activity.api'
import { useSocket } from '../context/SocketContext'
import { useDebounce } from '../hooks/useDebounce'
import { useToast } from '../components/ui/Toast'
import ActivityBadge, { formatTimeAgo } from '../components/ui/ActivityBadge'
import Pagination from '../components/ui/Pagination'
import StatCard from '../components/ui/StatCard'
import { TableSkeleton } from '../components/ui/Skeleton'

const EVENT_TYPE_GROUPS = [
  { value: '', label: 'All Event Types' },
  { value: 'USER_REGISTERED', label: 'Registration' },
  { value: 'USER_LOGIN', label: 'User Login' },
  { value: 'USER_LOGOUT', label: 'User Logout' },
  { value: 'PROFILE_UPDATED', label: 'Profile Update' },
  { value: 'RESUME_ANALYZED', label: 'ATS Resume Analysis' },
  { value: 'INTERVIEW_REPORT_GENERATED', label: 'Interview Prep Report' },
  { value: 'MATCH_SEARCHED', label: 'Job Match Search' },
  { value: 'MATCH_VIEWED', label: 'Job Match Viewed' },
  { value: 'FEEDBACK_SUBMITTED', label: 'Feedback Submitted' },
  { value: 'PAGE_VIEWED', label: 'Page Visited' },
]

export const ActivityList = () => {
  const { lastEvent, isConnected } = useSocket()
  const { toastError } = useToast()

  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [expandedRowId, setExpandedRowId] = useState(null)

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 400)
  const [eventTypeFilter, setEventTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchStats = useCallback(async () => {
    try {
      const data = await getActivityStats()
      if (data?.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.warn('[ActivityList] Stats error:', err.message)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchActivities = useCallback(
    async (page = 1) => {
      setLoading(true)
      try {
        const data = await getActivityList({
          page,
          limit: 20,
          search: debouncedSearch,
          eventType: eventTypeFilter,
          startDate,
          endDate,
          sortBy,
          sortOrder,
        })
        if (data) {
          setActivities(data.activities || [])
          setPagination(data.pagination || { page, totalPages: 1, total: 0, limit: 20 })
        }
      } catch (err) {
        console.error('[ActivityList] Fetch error:', err.message)
        toastError('Failed to load user activity records.')
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, eventTypeFilter, startDate, endDate, sortBy, sortOrder, toastError],
  )

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, eventTypeFilter, startDate, endDate, sortBy, sortOrder])

  useEffect(() => {
    fetchActivities(currentPage)
  }, [currentPage, fetchActivities])

  // Real-time update via Socket.IO
  useEffect(() => {
    if (lastEvent) {
      fetchActivities(currentPage)
      fetchStats()
    }
  }, [lastEvent, currentPage, fetchActivities, fetchStats])

  const resetFilters = () => {
    setSearchInput('')
    setEventTypeFilter('')
    setStartDate('')
    setEndDate('')
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  const toggleRowExpansion = (id) => {
    setExpandedRowId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              User Activity Stream
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isConnected
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 live-indicator' : 'bg-amber-400'}`} />
              <span>{isConnected ? 'Live Sync' : 'Connecting'}</span>
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Real-time chronological telemetry tracking authentic user actions across MatchWise AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(searchInput || eventTypeFilter || startDate || endDate || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Activities Recorded"
          value={stats?.totalActivities ?? pagination.total}
          subtitle="Lifetime system telemetry"
          icon={Activity}
          color="blue"
        />

        <StatCard
          title="Activities Today"
          value={stats?.todayActivities ?? 0}
          subtitle="Events recorded since midnight"
          icon={Zap}
          color="emerald"
        />

        <StatCard
          title="Active Users (Last 24h)"
          value={stats?.activeUsersCount24h ?? 0}
          subtitle="Distinct active user accounts"
          icon={Users}
          color="purple"
        />

        <StatCard
          title="Most Active Category"
          value={
            stats?.eventBreakdown
              ? Object.entries(stats.eventBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, ' ') || 'None'
              : 'AI Resumes'
          }
          subtitle="Highest volume action type"
          icon={Sparkles}
          color="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search by username, email, description */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by user name, email, or action..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {EVENT_TYPE_GROUPS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-')
                setSortBy(sb)
                setSortOrder(so)
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
            </select>
          </div>

          {/* Date Filter (Start Date) */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="From date"
              className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-2 shrink-0">
            Filter Type:
          </span>
          {[
            { value: '', label: 'All Actions' },
            { value: 'USER_LOGIN', label: 'Logins' },
            { value: 'USER_REGISTERED', label: 'Registrations' },
            { value: 'RESUME_ANALYZED', label: 'ATS Resumes' },
            { value: 'INTERVIEW_REPORT_GENERATED', label: 'Interview Prep' },
            { value: 'MATCH_SEARCHED', label: 'Job Matches' },
            { value: 'FEEDBACK_SUBMITTED', label: 'Feedback' },
          ].map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => setEventTypeFilter(pill.value)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                eventTypeFilter === pill.value
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 overflow-hidden backdrop-blur-xl shadow-xl">
        {loading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : activities.length === 0 ? (
          <div className="py-20 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <Activity size={24} />
            </div>
            <h4 className="text-lg font-bold text-white">No activity records found</h4>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {searchInput || eventTypeFilter || startDate || endDate
                ? 'No activities match the selected filter criteria. Try resetting filters.'
                : 'No user telemetry events have been recorded in the database yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">User / Actor</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Action Summary</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Details & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {activities.map((item) => {
                  const isExpanded = expandedRowId === item.id
                  const hasMetadata = item.metadata && Object.keys(item.metadata).length > 0

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* User Column */}
                      <td className="py-4 px-4 sm:px-6">
                        {item.user ? (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                              {item.user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/users/${item.user.id}`}
                                className="font-bold text-white hover:text-emerald-400 transition-colors block truncate"
                              >
                                {item.user.username}
                              </Link>
                              <p className="text-xs text-slate-400 truncate">{item.user.email}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                            <User size={16} />
                            <span className="text-xs italic">Unlinked / System</span>
                          </div>
                        )}
                      </td>

                      {/* Event Type Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <ActivityBadge eventType={item.eventType} />
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 max-w-sm sm:max-w-md">
                        <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed break-words">
                          {item.description}
                        </p>
                        {hasMetadata && (
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {Object.entries(item.metadata).slice(0, 3).map(([k, v]) => (
                              <span
                                key={k}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400"
                              >
                                <span className="text-slate-400">{k}:</span>
                                <span className="text-emerald-300 font-bold">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs">
                        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span>{formatTimeAgo(item.createdAt)}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.user && (
                            <Link
                              to={`/users/${item.user.id}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/30 transition-colors"
                              title="View User Profile"
                            >
                              <User size={13} />
                              <span className="hidden sm:inline">View User</span>
                            </Link>
                          )}

                          {hasMetadata && (
                            <button
                              type="button"
                              onClick={() => toggleRowExpansion(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                              title="Toggle Metadata Inspector"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="border-t border-slate-800/80 bg-slate-950/40 px-4 sm:px-6">
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setCurrentPage(page)}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default ActivityList
