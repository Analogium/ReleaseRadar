import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, UserMinus } from 'lucide-react'
import type { Artist, Release } from '@/lib/types'
import ReleaseCard from './ReleaseCard'

interface LibraryArtistSectionProps {
  artist: Artist
  releases: Release[]
  onUnfollow: (id: string) => Promise<void>
}

/** Un artiste suivi et ses sorties, avec bouton « Ne plus suivre ». */
export default function LibraryArtistSection({
  artist,
  releases,
  onUnfollow,
}: LibraryArtistSectionProps) {
  const [pending, setPending] = useState(false)

  async function unfollow() {
    setPending(true)
    try {
      await onUnfollow(artist.id)
    } finally {
      setPending(false)
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-4">
        <Link to={`/library/${artist.id}`} className="group flex min-w-0 items-center gap-3">
          <div className="gradient-brand flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
            {artist.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-content group-hover:text-accent truncate text-lg font-bold transition-colors">
              {artist.name}
            </h2>
            <p className="text-content-subtle text-xs">
              {releases.length === 0
                ? 'Aucune sortie'
                : `${releases.length} sortie${releases.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={unfollow}
          disabled={pending}
          className="text-content-subtle hover:text-danger ml-auto flex shrink-0 items-center gap-2 text-sm transition-colors disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserMinus className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Ne plus suivre</span>
        </button>
      </div>

      {releases.length === 0 ? (
        <p className="border-line text-content-subtle rounded-[var(--radius-card)] border border-dashed px-4 py-6 text-center text-sm">
          Aucune sortie synchronisée pour le moment.
        </p>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-2">
          {releases.map((release) => (
            <div key={release.id} className="w-40 shrink-0">
              <ReleaseCard release={release} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
