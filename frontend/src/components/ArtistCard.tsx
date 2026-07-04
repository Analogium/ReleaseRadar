import { Link } from 'react-router-dom'
import type { Artist } from '@/lib/types'

/**
 * Vignette d'artiste suivi : avatar initiale + nom. Cliquable vers la Library
 * (le détail artiste dédié arrivera à l'étape 10.6).
 */
export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      to="/library"
      className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center"
    >
      <div className="gradient-brand flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white transition-transform group-hover:scale-105">
        {artist.name.charAt(0).toUpperCase()}
      </div>
      <span className="text-content-muted w-full truncate text-sm">{artist.name}</span>
    </Link>
  )
}
