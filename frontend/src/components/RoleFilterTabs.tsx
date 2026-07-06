import type { ArtistRole } from '@/lib/types'
import { ROLE_TAB_LABEL, type RoleFilter } from '@/lib/roles'

const ROLE_ORDER: ArtistRole[] = ['PRIMARY', 'COLLABORATION', 'FEATURING']

interface RoleFilterTabsProps {
  releases: { role: ArtistRole }[]
  active: RoleFilter
  onChange: (filter: RoleFilter) => void
}

/**
 * Onglets « Tout / Solo / Collaborations / Featurings » avec compteurs.
 * Un onglet de rôle n'apparaît que s'il contient au moins une sortie.
 */
export default function RoleFilterTabs({ releases, active, onChange }: RoleFilterTabsProps) {
  const countOf = (role: ArtistRole) => releases.filter((r) => r.role === role).length
  const tabs: { value: RoleFilter; count: number }[] = [
    { value: 'ALL', count: releases.length },
    ...ROLE_ORDER.map((role) => ({ value: role, count: countOf(role) })).filter((t) => t.count > 0),
  ]

  return (
    <div role="tablist" className="border-line flex gap-1 border-b">
      {tabs.map(({ value, count }) => {
        const isActive = active === value
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'border-accent text-content'
                : 'text-content-subtle hover:text-content border-transparent'
            }`}
          >
            {ROLE_TAB_LABEL[value]}
            <span
              className={`rounded-full px-1.5 text-xs ${
                isActive ? 'bg-surface-3 text-content-muted' : 'text-content-subtle'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
