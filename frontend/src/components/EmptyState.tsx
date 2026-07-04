import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  message?: string
  action?: ReactNode
}

/** Bloc centré pour les listes vides ou les erreurs de chargement. */
export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="border-line flex flex-col items-center rounded-[var(--radius-card)] border border-dashed px-6 py-14 text-center">
      <div className="bg-surface-2 text-content-subtle mb-4 rounded-full p-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-content text-lg font-semibold">{title}</h3>
      {message && <p className="text-content-subtle mt-1 max-w-sm text-sm">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
