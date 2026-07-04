import type { InputHTMLAttributes, ReactNode } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: ReactNode
  trailing?: ReactNode
}

export default function TextField({ label, icon, trailing, id, ...rest }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-content-muted text-xs font-semibold">
        {label}
      </label>
      <div className="relative mt-2 flex items-center">
        <span className="text-content-subtle pointer-events-none absolute left-3">{icon}</span>
        <input
          id={id}
          className={`bg-surface-2 border-line text-content placeholder:text-content-subtle focus:border-accent w-full rounded-[var(--radius-input)] border py-3 pl-10 ${trailing ? 'pr-10' : 'pr-4'} transition-colors outline-none`}
          {...rest}
        />
        {trailing && <span className="absolute right-3">{trailing}</span>}
      </div>
    </div>
  )
}
