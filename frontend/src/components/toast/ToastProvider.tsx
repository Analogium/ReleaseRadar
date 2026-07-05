import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { ToastContext, type Toast, type ToastType } from './context'
import Toaster from './Toaster'

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss])

  return (
    <ToastContext value={value}>
      {children}
      <Toaster />
    </ToastContext>
  )
}
