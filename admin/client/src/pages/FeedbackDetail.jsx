import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Shield,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquareQuote,
} from 'lucide-react'
import {
  deleteFeedback,
  getFeedbackDetail,
  updateFeedbackStatus,
} from '../services/feedback.api'
import { useToast } from '../components/ui/Toast'
import StatusBadge from '../components/ui/StatusBadge'
import RatingStars from '../components/ui/RatingStars'
import ConfirmModal from '../components/ui/ConfirmModal'
import { Skeleton } from '../components/ui/Skeleton'

export const FeedbackDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toastSuccess, toastError } = useToast()

  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFeedbackDetail(id)
      if (data?.feedback) {
        setFeedback(data.feedback)
      }
    } catch (err) {
      console.error('[FeedbackDetail] Fetch error:', err.message)
      toastError('Unable to load feedback details.')
    } finally {
      setLoading(false)
    }
  }, [id, toastError])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true)
    try {
      const data = await updateFeedbackStatus(id, newStatus)
      if (data?.feedback) {
        setFeedback(data.feedback)
        toastSuccess(`Feedback marked as '${newStatus}'.`)
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update feedback status.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteFeedback(id)
      toastSuccess('Feedback submission deleted successfully.')
      navigate('/feedback', { replace: true })
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete feedback.')
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle size={40} className="text-rose-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Feedback Not Found</h3>
        <p className="text-sm text-slate-400">
          The requested feedback record does not exist or may have been deleted.
        </p>
        <Link
          to="/feedback"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Feedback List
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <Link
            to="/feedback"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Feedback Inspection</span>
              <StatusBadge status={feedback.status} />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ID: <span className="font-mono text-slate-400">{feedback.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Delete Record</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content & Message Panel (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feedback Body Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <RatingStars rating={feedback.rating} size={20} showNumber />
                <span className="text-slate-400 text-xs">•</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 border border-slate-700">
                  {feedback.type?.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar size={14} />
                <span>
                  Submitted:{' '}
                  {new Date(feedback.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                User Feedback Message
              </h4>
              {/* Plain-text rendering: XSS safe, whitespace preserved */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words font-normal">
                {feedback.message}
              </div>
            </div>

            {/* Moderation Controls Card */}
            <div className="pt-4 border-t border-slate-800/60">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Update Moderation Status
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isUpdating || feedback.status === 'approved'}
                  onClick={() => handleStatusUpdate('approved')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    feedback.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <CheckCircle2 size={16} />
                  <span>Mark as Approved</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating || feedback.status === 'rejected'}
                  onClick={() => handleStatusUpdate('rejected')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    feedback.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <XCircle size={16} />
                  <span>Mark as Rejected</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating || feedback.status === 'pending'}
                  onClick={() => handleStatusUpdate('pending')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    feedback.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Clock size={16} />
                  <span>Reset to Pending</span>
                </button>
              </div>
            </div>
          </div>

          {/* Moderation History Card */}
          {feedback.moderatedAt && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-300 flex items-center gap-2">
                <Shield size={14} className="text-purple-400" />
                <span>Last Moderated:</span>
                <span className="text-white">
                  {new Date(feedback.moderatedAt).toLocaleString()}
                </span>
              </p>
              {feedback.moderatedBy && (
                <p>
                  Moderated By Administrator:{' '}
                  <span className="font-semibold text-slate-200">
                    {feedback.moderatedBy.username} ({feedback.moderatedBy.email})
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Column: Author / User Information (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <User size={18} className="text-emerald-400" />
              <span>Feedback Author</span>
            </h3>

            {feedback.user ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-lg font-bold flex items-center justify-center shadow-md shrink-0">
                    {feedback.user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {feedback.user.username}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{feedback.user.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    User ID
                  </label>
                  <p className="font-mono text-xs text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 break-all select-all">
                    {feedback.user.id}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Account Status
                  </label>
                  <StatusBadge
                    status={feedback.user.isActive ? 'active' : 'inactive'}
                    size="sm"
                  />
                </div>

                {feedback.user.createdAt && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Member Since
                    </label>
                    <p className="text-slate-300">
                      {new Date(feedback.user.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800/60">
                  <Link
                    to={`/users/${feedback.user.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    <User size={14} />
                    <span>View User Admin Profile</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs space-y-2">
                <MessageSquareQuote size={28} className="text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">Anonymous / Unlinked Submission</p>
                <p className="text-[11px]">
                  This feedback was submitted by a guest or the user account was not attached.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Feedback Submission"
        message="Are you sure you want to delete this feedback? This record will be permanently purged from the database."
        confirmText="Confirm Delete"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}

export default FeedbackDetail
