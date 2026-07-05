import { useContext } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { ToastContext, type ToastType } from './context'

const CONFIG: Record<ToastType, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'border-success/30 text-success' },
  error: { icon: AlertTriangle, className: 'border-danger/30 text-danger' },
  info: { icon: Info, className: 'border-line-strong text-content' },
}

/** Pile de notifications, ancrée en bas à droite (au-dessus de tout le reste). */
export default function Toaster() {
  const ctx = useContext(ToastContext)
  if (!ctx) return null

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {ctx.toasts.map((toast) => {
        const { icon: Icon, className } = CONFIG[toast.type]
        return (
          <div
            key={toast.id}
            role="status"
            className={`animate-toast-in bg-surface-2 pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-[var(--shadow-ambient)] ${className}`}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="text-content flex-1 text-sm">{toast.message}</span>
            <button
              type="button"
              onClick={() => ctx.dismiss(toast.id)}
              className="text-content-subtle hover:text-content"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
