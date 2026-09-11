import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  MessageSquareQuote,
  User,
} from 'lucide-react'
import {
  deleteFeedback,
  getFeedbackList,
  updateFeedbackStatus,
} from '../services/feedback.api'
import { useSocket } from '../context/SocketContext'
import { useDebounce } from '../hooks/useDebounce'
import { useToast } from '../components/ui/Toast'
import StatusBadge from '../components/ui/StatusBadge'
import RatingStars from '../components/ui/RatingStars'
import Pagination from '../components/ui/Pagination'
import ConfirmModal from '../components/ui/ConfirmModal'
import { TableSkeleton } from '../components/ui/Skeleton'

const FEEDBACK_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'ui_ux', label: 'UI / UX' },
  { value: 'job_matching', label: 'Job Matching' },
  { value: 'resume', label: 'Resume' },
  { value: 'interview', label: 'Interview' },
  { value: 'other', label: 'Other' },
]

export const FeedbackList = () => {
  const { lastEvent } = useSocket()
  const { toastSuccess, toastError } = useToast()

  const [feedbackList, setFeedbackList] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 15 })
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 400)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Modals & Action States
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionBusyId, setActionBusyId] = useState(null)

  const fetchFeedback = useCallback(
    async (page = 1) => {
      setLoading(true)
      try {
        const data = await getFeedbackList({
          page,
          limit: 15,
          search: debouncedSearch,
          status: statusFilter,
          type: typeFilter,
          rating: ratingFilter,
        })
        if (data) {
          setFeedbackList(data.feedback || [])
          setPagination(data.pagination || { page, totalPages: 1, total: 0, limit: 15 })
        }
      } catch (err) {
        console.error('[FeedbackList] Fetch error:', err.message)
        toastError('Failed to load feedback records.')
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, statusFilter, typeFilter, ratingFilter, toastError],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter, typeFilter, ratingFilter])

  useEffect(() => {
    fetchFeedback(currentPage)
  }, [currentPage, fetchFeedback])

  // Real-time update via Socket.IO
  useEffect(() => {
    if (lastEvent) {
      fetchFeedback(currentPage)
    }
  }, [lastEvent, currentPage, fetchFeedback])

  const handleStatusChange = async (id, newStatus) => {
    setActionBusyId(id)
    try {
      await updateFeedbackStatus(id, newStatus)
      toastSuccess(`Feedback status updated to '${newStatus}'.`)
      await fetchFeedback(currentPage)
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update feedback status.')
    } finally {
      setActionBusyId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteFeedback(deleteTarget.id)
      toastSuccess('Feedback submission deleted successfully.')
      setDeleteTarget(null)
      await fetchFeedback(currentPage)
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete feedback.')
    } finally {
      setIsDeleting(false)
    }
  }

  const resetFilters = () => {
    setSearchInput('')
    setStatusFilter('')
    setTypeFilter('')
    setRatingFilter('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Feedback Management
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Moderate, filter, and inspect genuine user feedback from the MatchWise database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(searchInput || statusFilter || typeFilter || ratingFilter) && (
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

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by feedback message or username..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Moderation</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Types</option>
              {FEEDBACK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars (★★★★★)</option>
              <option value="4">4 Stars (★★★★☆)</option>
              <option value="3">3 Stars (★★★☆☆)</option>
              <option value="2">2 Stars (★★☆☆☆)</option>
              <option value="1">1 Star (★☆☆☆☆)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-2">
            Quick Status:
          </span>
          {[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => setStatusFilter(pill.value)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === pill.value
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Table Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 overflow-hidden backdrop-blur-xl shadow-xl">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : feedbackList.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquareQuote size={24} />
            </div>
            <h4 className="text-lg font-bold text-white">No feedback records found</h4>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {searchInput || statusFilter || typeFilter || ratingFilter
                ? 'No feedback matches the selected filters. Try clearing some criteria.'
                : 'There are currently no feedback submissions recorded in MongoDB.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">User / Author</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Message Content</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {feedbackList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* User / Author Column */}
                    <td className="py-4 px-4 sm:px-6 font-medium">
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
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-950 text-slate-500 border border-slate-800/80">
                              ID: {String(item.user.id).slice(-6)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <div className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500">
                            <User size={15} />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-400 block">
                              Anonymous / Unlinked
                            </span>
                            <span className="text-[10px] text-slate-500">No account linked</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <RatingStars rating={item.rating} size={14} showNumber />
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300">
                        {item.type?.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Message Preview (Plain-text safe rendering) */}
                    <td className="py-4 px-4 max-w-xs md:max-w-md">
                      <p className="line-clamp-2 text-slate-300 leading-relaxed text-xs sm:text-sm break-words">
                        {item.message}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Moderation Dropdown */}
                        <select
                          value={item.status}
                          disabled={actionBusyId === item.id}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="px-2 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                        </select>

                        {/* View User Profile Link */}
                        {item.user && (
                          <Link
                            to={`/users/${item.user.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-colors"
                            title="View User Profile"
                          >
                            <User size={16} />
                          </Link>
                        )}

                        {/* View Feedback Details */}
                        <Link
                          to={`/feedback/${item.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-colors"
                          title="View Full Feedback Details"
                        >
                          <Eye size={16} />
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                          title="Delete Feedback"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="border-t border-slate-800/80 bg-slate-950/40 px-4 sm:px-6">
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setCurrentPage(page)}
            loading={loading}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Feedback Submission"
        message={`Are you sure you want to permanently delete this feedback submission? This action cannot be undone.`}
        confirmText="Delete Feedback"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default FeedbackList
