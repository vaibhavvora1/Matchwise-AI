import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquareQuote,
  Users,
  UserCheck,
  LogOut,
  Radio,
  Sparkles,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'

export const Sidebar = ({ isOpen, onClose }) => {
  const { adminUser, logout } = useAuth()
  const { isConnected } = useSocket()

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/activity',
      label: 'Activity Stream',
      icon: Activity,
    },
    {
      to: '/feedback',
      label: 'Feedback Management',
      icon: MessageSquareQuote,
    },
    {
      to: '/users',
      label: 'User Directory',
      icon: Users,
    },
    {
      to: '/profile',
      label: 'Admin Account',
      icon: UserCheck,
    },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl tracking-wider">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  MatchWise
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                Admin Control Hub
              </p>
            </div>
          </div>
        </div>

        {/* Real-time sync badge */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 live-indicator' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300 font-medium">
                {isConnected ? 'Real-Time Sync Active' : 'Connecting Sync...'}
              </span>
            </div>
            <Radio size={14} className={isConnected ? 'text-emerald-400' : 'text-amber-400'} />
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Overview & Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  size={14}
                  className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-400"
                />
              </NavLink>
            )
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3 p-2 rounded-xl mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
              {adminUser?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {adminUser?.username || 'Admin User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{adminUser?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
