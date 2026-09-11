export const StatusBadge = ({ status, size = 'md' }) => {
  const normalized = String(status || '').toLowerCase()

  const configMap = {
    pending: {
      label: 'Pending Moderation',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
    },
    approved: {
      label: 'Approved',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400',
    },
    active: {
      label: 'Active',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    inactive: {
      label: 'Deactivated',
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      dot: 'bg-slate-400',
    },
    admin: {
      label: 'Administrator',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      dot: 'bg-purple-400',
    },
    user: {
      label: 'Standard User',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      dot: 'bg-blue-400',
    },
  }

  const config = configMap[normalized] || {
    label: status,
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-semibold'
      : 'px-2.5 py-1 text-xs font-medium'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

export default StatusBadge
