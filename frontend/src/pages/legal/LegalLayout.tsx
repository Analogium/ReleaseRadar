import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'

const LEGAL_LINKS = [
  { to: '/terms', label: 'CGU' },
  { to: '/privacy', label: 'Confidentialité' },
  { to: '/legal', label: 'Mentions légales' },
]

/** Mise en page commune des pages légales (publiques, hors shell applicatif). */
export default function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt: string
  children: ReactNode
}) {
  return (
    <div className="min-h-svh px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-content font-extrabold">Release Radar</span>
          </Link>
          <Link
            to="/login"
            className="text-content-subtle hover:text-content flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>

        <h1 className="text-content text-3xl font-bold">{title}</h1>
        <p className="text-content-subtle mt-1 text-sm">Dernière mise à jour : {updatedAt}</p>

        <article className="legal-prose text-content-muted mt-8 space-y-6 text-sm leading-relaxed">
          {children}
        </article>

        <footer className="border-line text-content-subtle mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-content">
              {link.label}
            </Link>
          ))}
        </footer>
      </div>
    </div>
  )
}
