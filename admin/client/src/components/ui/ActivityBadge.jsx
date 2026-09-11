import {
  UserPlus,
  LogIn,
  LogOut,
  ShieldAlert,
  UserCheck,
  FileText,
  Sparkles,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquareQuote,
  Globe,
  Zap,
  Activity,
} from 'lucide-react'

const EVENT_CONFIG = {
  USER_REGISTERED: {
    label: 'Registration',
    icon: UserPlus,
    bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  USER_LOGIN: {
    label: 'Login',
    icon: LogIn,
    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  USER_LOGOUT: {
    label: 'Logout',
    icon: LogOut,
    bg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
  },
  USER_LOGOUT_ALL: {
    label: 'Revoke All Sessions',
    icon: ShieldAlert,
    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  PROFILE_UPDATED: {
    label: 'Profile Update',
    icon: UserCheck,
    bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
  },
  RESUME_ANALYZED: {
    label: 'ATS Resume',
    icon: FileText,
    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  INTERVIEW_REPORT_GENERATED: {
    label: 'Interview Prep',
    icon: Sparkles,
    bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
  MATCH_SEARCHED: {
    label: 'Job Match Search',
    icon: Search,
    bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    dot: 'bg-teal-400',
  },
  MATCH_VIEWED: {
    label: 'Job Match Viewed',
    icon: Eye,
    bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  MATCH_ACCEPTED: {
    label: 'Match Saved',
    icon: CheckCircle2,
    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  MATCH_REJECTED: {
    label: 'Match Dismissed',
    icon: XCircle,
    bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
  },
  FEEDBACK_SUBMITTED: {
    label: 'Feedback',
    icon: MessageSquareQuote,
    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  PAGE_VIEWED: {
    label: 'Page View',
    icon: Globe,
    bg: 'bg-slate-800/60 text-slate-400 border-slate-700/60',
    dot: 'bg-slate-500',
  },
  FEATURE_USED: {
    label: 'Feature Interaction',
    icon: Zap,
    bg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    dot: 'bg-violet-400',
  },
}

export const ActivityBadge = ({ eventType, size = 'md', showIcon = true }) => {
  const config = EVENT_CONFIG[eventType] || {
    label: eventType?.replace(/_/g, ' ') || 'Activity',
    icon: Activity,
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
  }

  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size] || 'px-2.5 py-1 text-xs gap-1.5'

  const iconSizes = { sm: 11, md: 13, lg: 15 }[size] || 13

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-lg border shrink-0 ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  )
}

export const getActivityIcon = (eventType) => {
  return EVENT_CONFIG[eventType]?.icon || Activity
}

export const formatTimeAgo = (date) => {
  if (!date) return '—'
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 45) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default ActivityBadge
