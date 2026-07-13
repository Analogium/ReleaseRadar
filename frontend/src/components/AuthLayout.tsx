import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

/** Carte centrée « glassmorphe » sur fond sombre avec halos dégradés. */
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-4">
      {/* Halos d'ambiance (évoquent la collage d'album floutée du design) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-violet/20 absolute -top-24 -left-24 h-96 w-96 rounded-full blur-[120px]" />
        <div className="bg-magenta/20 absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-[120px]" />
      </div>

      <div className="border-line bg-surface/80 relative w-full max-w-md rounded-2xl border p-8 shadow-[var(--shadow-ambient)] backdrop-blur-xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-content text-center text-3xl font-bold">{title}</h1>
        <p className="text-content-subtle mt-2 text-center text-sm">{subtitle}</p>

        <div className="mt-8">{children}</div>

        <div className="text-content-subtle mt-6 text-center text-sm">{footer}</div>

        <div className="text-content-subtle mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <Link to="/terms" className="hover:text-content">
            CGU
          </Link>
          <Link to="/privacy" className="hover:text-content">
            Confidentialité
          </Link>
          <Link to="/legal" className="hover:text-content">
            Mentions légales
          </Link>
        </div>
      </div>
    </div>
  )
}
