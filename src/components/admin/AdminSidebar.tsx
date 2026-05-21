import { useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, Link2, Users, Cpu, LogOut, Zap } from 'lucide-react'
import type { AdminInfo } from '../../types/access'

interface AdminSidebarProps {
  admin: AdminInfo
  onLogout: () => void
}

const NAV = [
  { path: '/admin/predictions', label: 'Predictions', Icon: BarChart3 },
  { path: '/admin/links',       label: 'Access Links', Icon: Link2     },
  { path: '/admin/admins',      label: 'Admins',       Icon: Users,  superadminOnly: true },
  { path: '/admin/model',       label: 'Model',        Icon: Cpu      },
] as const

export function AdminSidebar({ admin, onLogout }: AdminSidebarProps) {
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  return (
    <aside className="
      bg-bg-secondary border-b md:border-b-0 md:border-r border-border
      flex flex-row md:flex-col
      w-full md:w-56 md:min-w-[14rem] md:min-h-screen shrink-0
    ">
      {/* Logo — md+ only */}
      <div className="hidden md:flex items-center gap-2 px-5 py-5 border-b border-border">
        <div className="w-7 h-7 rounded bg-accent-cyan-glow border border-accent-cyan flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-accent-cyan" />
        </div>
        <div>
          <p className="text-accent-cyan font-mono font-bold text-sm leading-none">CardioToxAI</p>
          <p className="text-text-muted text-[10px] font-mono mt-0.5 uppercase tracking-widest">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-row md:flex-col flex-1 p-2 md:p-3 gap-0.5 overflow-x-auto md:overflow-x-visible">
        {NAV.map(({ path, label, Icon, ...rest }) => {
          const superadminOnly = 'superadminOnly' in rest ? rest.superadminOnly : false
          if (superadminOnly && !admin.is_superadmin) return null
          const active = pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg whitespace-nowrap
                transition-all font-mono text-xs md:text-sm shrink-0
                ${active
                  ? 'bg-accent-cyan-glow text-accent-cyan border border-accent-cyan/30'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
                }`}
            >
              <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Admin info + logout — md+ */}
      <div className="hidden md:block p-4 border-t border-border space-y-3">
        <div>
          <p className="text-text-primary font-mono text-xs font-medium">{admin.username}</p>
          <p className="text-text-muted font-mono text-[10px]">
            {admin.is_superadmin ? 'Superadmin' : 'Admin'}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
            text-text-muted hover:text-red-400 hover:bg-red-950/30 transition-all
            font-mono text-xs border border-transparent hover:border-red-900/50"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Logout — mobile only */}
      <button
        onClick={onLogout}
        className="md:hidden flex items-center gap-1.5 px-3 py-2 m-2 rounded-lg
          text-text-muted hover:text-red-400 transition-colors font-mono text-xs shrink-0"
      >
        <LogOut className="w-3.5 h-3.5" />
        Out
      </button>
    </aside>
  )
}
