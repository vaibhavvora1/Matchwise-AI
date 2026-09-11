import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Clock,
  LogOut,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/ui/StatusBadge'

export const Profile = () => {
  const { adminUser, logout } = useAuth()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/60">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Administrator Account
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Manage your administrator session and view access details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-emerald-500/20 border border-purple-500/30 text-purple-300 font-extrabold text-2xl flex items-center justify-center shadow-lg">
              {adminUser?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{adminUser?.username || 'Administrator'}</span>
                <StatusBadge status="admin" size="sm" />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{adminUser?.email}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/60 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User size={14} /> Username
              </span>
              <span className="text-white font-medium">{adminUser?.username}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Mail size={14} /> Email Address
              </span>
              <span className="text-white font-medium">{adminUser?.email}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck size={14} /> Access Level
              </span>
              <span className="text-purple-400 font-bold">Full Administrator (Superuser)</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock size={14} /> Last Session Started
              </span>
              <span className="text-slate-200">
                {adminUser?.lastLoginAt ? new Date(adminUser.lastLoginAt).toLocaleString() : 'Active now'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <KeyRound size={14} /> Admin User ID
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{adminUser?.id}</span>
            </div>
          </div>
        </div>

        {/* Session Actions Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Session Security</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your administrative session is protected by cryptographic tokens and rotating refresh keys.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out of Admin Control</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
