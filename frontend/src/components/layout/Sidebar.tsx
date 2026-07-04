import { NavLink } from 'react-router-dom'
import { Compass, Home, Library, LogOut, Shield } from 'lucide-react'
import Logo from '@/components/Logo'
import { useAuth } from '@/auth/useAuth'

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/discovery', label: 'Discovery', icon: Compass, end: false },
  { to: '/library', label: 'Library', icon: Library, end: false },
]

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const initial = user?.email.charAt(0).toUpperCase() ?? '?'

  return (
    <aside className="border-line bg-surface hidden w-64 shrink-0 flex-col border-r p-6 md:flex">
      <div className="flex items-center gap-3">
        <Logo size={32} />
        <span className="text-content text-xl leading-none font-extrabold">
          Release
          <br />
          Radar
        </span>
      </div>

      <nav className="mt-10 flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-surface-3 text-content'
                  : 'text-content-subtle hover:text-content hover:bg-surface-2'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-surface-3 text-content'
                  : 'text-content-subtle hover:text-content hover:bg-surface-2'
              }`
            }
          >
            <Shield className="h-5 w-5" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3">
          <div className="gradient-brand flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white">
            {initial}
          </div>
          <span className="text-content-muted min-w-0 flex-1 truncate text-sm">{user?.email}</span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-content-subtle hover:text-content mt-4 flex items-center gap-2 text-sm"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </aside>
  )
}
