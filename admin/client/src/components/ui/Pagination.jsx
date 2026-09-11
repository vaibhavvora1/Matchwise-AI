import { ChevronLeft, ChevronRight } from 'lucide-react'

export const Pagination = ({
  pagination,
  onPageChange,
  loading = false,
}) => {
  const { page = 1, totalPages = 1, total = 0, limit = 15 } = pagination || {}

  if (totalPages <= 1 && total <= limit) {
    return null
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-sm text-slate-400">
      <div>
        Showing <span className="font-semibold text-slate-200">{total > 0 ? start : 0}</span> to{' '}
        <span className="font-semibold text-slate-200">{end}</span> of{' '}
        <span className="font-semibold text-slate-200">{total}</span> records
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          Page {page} of {totalPages || 1}
        </span>

        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default Pagination
