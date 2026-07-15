import { Loader2 } from 'lucide-react'

/** Fallback affiché pendant le chargement d'une route découpée (lazy). */
export default function PageLoader() {
  return (
    <div
      className="flex min-h-svh items-center justify-center"
      role="status"
      aria-label="Chargement"
    >
      <Loader2 className="text-accent h-8 w-8 animate-spin" />
    </div>
  )
}
