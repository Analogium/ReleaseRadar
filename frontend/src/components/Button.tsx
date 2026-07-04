import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: ReactNode
}

export default function Button({ loading, children, disabled, className, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled === true || loading === true}
      className={`gradient-brand flex w-full items-center justify-center gap-2 rounded-full py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ''}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
