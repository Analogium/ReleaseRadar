import { useContext } from 'react'
import { ToastContext } from './context'

/** Accès aux notifications toast : `toast.success(...)`, `toast.error(...)`, `toast.info(...)`. */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast doit être utilisé dans un ToastProvider')
  }
  return {
    success: (message: string) => ctx.notify('success', message),
    error: (message: string) => ctx.notify('error', message),
    info: (message: string) => ctx.notify('info', message),
  }
}
