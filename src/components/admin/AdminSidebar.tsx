import { Link2, Users, LogOut } from 'lucide-react'
import { ADMIN_JWT_KEY } from '../../api/adminClient'
import type { AdminInfo } from '../../types/access'

type Section = 'links' | 'admins'

interface AdminSidebarProps {
  active: Section
  onSelect: (s: Section) => void
  admin: AdminInfo
  onLogout: () => void
}

const NAV: { id: Section; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'links',  label: 'Access Links', Icon: Link2 },
  { id: 'admins', label: 'Admins',        Icon: Users },
]

export function AdminSidebar({ active, onSelect, admin, onLogout }: AdminSidebarProps) {
  const handleLogout = () => {
    localStorage.removeItem(ADMIN_JWT_KEY)
    onLogout()
  }

  return (
    <aside className="
      bg-bg-secondary border-b md:border-b-0 md:border-r border-border
      flex flex-row md:flex-col
      w-full md:w-56 md:min-w-[14rem] md:min-h-screen
    ">
      {/* Logo — hidden on mobile, shown on md+ */}
      <div className="hidden md:block px-5 py-5 border-b border-border">
        <p className="text-accent-cyan font-mono font-bold text-sm tracking-wider">CardioToxAI</p>
        <p className="text-text-muted text-[10px] font-mono mt-0.5 uppercase tracking-widest">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-row md:flex-col flex-1 p-2 md:p-3 gap-0.5">
        {NAV.map(({ id, label, Icon }) => {
          if (id === 'admins' && !admin.is_superadmin) return null
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg text-left
                transition-all font-mono text-xs md:text-sm
                ${active === id
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

      {/* Admin info + logout — hidden on mobile nav bar */}
      <div className="hidden md:block p-4 border-t border-border space-y-3">
        <div>
          <p className="text-text-primary font-mono text-xs font-medium">{admin.username}</p>
          <p className="text-text-muted font-mono text-[10px]">{admin.is_superadmin ? 'Superadmin' : 'Admin'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
            text-text-muted hover:text-red-400 hover:bg-red-950/30 transition-all
            font-mono text-xs border border-transparent hover:border-red-900/50"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Logout button for mobile */}
      <button
        onClick={handleLogout}
        className="md:hidden flex items-center gap-1.5 px-3 py-2 m-2 rounded-lg
          text-text-muted hover:text-red-400 transition-colors font-mono text-xs"
      >
        <LogOut className="w-3.5 h-3.5" />
        Out
      </button>
    </aside>
  )
}
