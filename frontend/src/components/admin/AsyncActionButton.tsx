import { type ReactNode, useState } from 'react'
import { Check, type LucideIcon, X } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { apiErrorMessage } from '@/lib/api'

type Status = 'idle' | 'pending' | 'done' | 'error'

interface AsyncActionButtonProps {
  onAction: () => Promise<void>
  children: ReactNode
  icon?: LucideIcon
  className?: string
  onError?: (message: string) => void
}

/** Bouton déclenchant une action async, avec spinner puis coche ✓ / croix ✗ transitoire. */
export default function AsyncActionButton({
  onAction,
  children,
  icon: Icon,
  className,
  onError,
}: AsyncActionButtonProps) {
  const [status, setStatus] = useState<Status>('idle')

  async function run() {
    setStatus('pending')
    try {
      await onAction()
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setStatus('error')
      onError?.(apiErrorMessage(err))
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={status === 'pending'}
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${className ?? ''}`}
    >
      {status === 'pending' && <Loader2 className="h-4 w-4 animate-spin" />}
      {status === 'done' && <Check className="h-4 w-4" />}
      {status === 'error' && <X className="h-4 w-4" />}
      {status === 'idle' && Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}
