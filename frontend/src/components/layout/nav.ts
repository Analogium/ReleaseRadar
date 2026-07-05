import { Compass, Home, Library, type LucideIcon, Shield } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
}

/** Liens de navigation communs à la Sidebar (desktop) et au menu mobile. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/discovery', label: 'Discovery', icon: Compass, end: false },
  { to: '/library', label: 'Library', icon: Library, end: false },
]

/** Lien réservé aux administrateurs (ajouté conditionnellement). */
export const ADMIN_ITEM: NavItem = { to: '/admin', label: 'Admin', icon: Shield, end: false }

/** Classe partagée d'un lien de nav (état actif violet). */
export function navLinkClass(isActive: boolean): string {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-surface-3 text-content'
      : 'text-content-subtle hover:text-content hover:bg-surface-2'
  }`
}
