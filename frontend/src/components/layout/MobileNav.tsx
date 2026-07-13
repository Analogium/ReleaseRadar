import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router-dom'
import { LogOut, Menu, Settings, X } from 'lucide-react'
import Logo from '@/components/Logo'
import { useAuth } from '@/auth/useAuth'
import { ADMIN_ITEM, NAV_ITEMS, navLinkClass } from './nav'

/** Bouton hamburger + tiroir de navigation, visible uniquement sur mobile (`md:hidden`). */
export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const items = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-content-subtle hover:text-content"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Rendu via portal sur <body> pour échapper au contexte d'empilement de la Topbar. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="absolute inset-0 h-full w-full bg-black/70"
            />
            <aside className="bg-surface border-line animate-toast-in absolute top-0 left-0 flex h-full w-72 flex-col border-r p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo size={28} />
                  <span className="text-content text-lg font-extrabold">Release Radar</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-content-subtle hover:text-content"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-8 flex flex-col gap-1">
                {items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => navLinkClass(isActive)}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto">
                <p className="text-content-subtle mb-3 truncate text-sm">{user?.email}</p>
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="text-content-subtle hover:text-content mb-3 flex items-center gap-2 text-sm"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-content-subtle hover:text-content flex items-center gap-2 text-sm"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  )
}
