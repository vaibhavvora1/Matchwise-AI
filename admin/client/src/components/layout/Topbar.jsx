import { Menu, ShieldCheck, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Topbar = ({ onMenuClick, title = 'Control Center' }) => {
  const { adminUser } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 lg:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Link to public application for reference */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <span>Main App</span>
          <ExternalLink size={13} />
        </a>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
          <ShieldCheck size={14} />
          <span className="hidden sm:inline">Role:</span>
          <span>ADMIN</span>
        </div>
      </div>
    </header>
  )
}

export default Topbar
