import { AlertTriangle, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Release } from '@/lib/types'
import { useApi } from '@/lib/useApi'
import { useFollowedArtists } from '@/lib/useFollowedArtists'
import LibraryArtistSection from '@/components/LibraryArtistSection'
import EmptyState from '@/components/EmptyState'

const SKELETONS = ['a1', 'a2', 'a3']

export default function Library() {
  const { artists, loading, error, unfollow, reload } = useFollowedArtists()
  const releases = useApi<Release[]>('/releases')

  const releasesByArtist = (artistId: string) =>
    releases.data?.filter((r) => r.artistId === artistId) ?? []

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <header className="mb-8">
        <h1 className="text-content text-3xl font-bold">Library</h1>
        <p className="text-content-subtle mt-1">Vos artistes suivis et leurs sorties.</p>
      </header>

      {loading && (
        <div className="flex flex-col gap-10">
          {SKELETONS.map((key) => (
            <div key={key} className="animate-pulse">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-surface-2 h-11 w-11 rounded-full" />
                <div className="space-y-2">
                  <div className="bg-surface-2 h-4 w-40 rounded" />
                  <div className="bg-surface-2 h-3 w-20 rounded" />
                </div>
              </div>
              <div className="bg-surface-2 h-48 rounded-[var(--radius-card)]" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon={AlertTriangle}
          title="Chargement impossible"
          message={error}
          action={
            <button
              type="button"
              onClick={reload}
              className="bg-surface-2 hover:bg-surface-3 text-content rounded-lg px-4 py-2 text-sm font-medium transition"
            >
              Réessayer
            </button>
          }
        />
      )}

      {!loading && !error && artists.length === 0 && (
        <EmptyState
          icon={Users}
          title="Vous ne suivez aucun artiste"
          message="Recherchez vos artistes préférés pour les retrouver ici avec leurs sorties."
          action={
            <Link
              to="/discovery"
              className="gradient-brand inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            >
              <UserPlus className="h-4 w-4" /> Follow Artists
            </Link>
          }
        />
      )}

      {!loading && !error && artists.length > 0 && (
        <div className="flex flex-col gap-10">
          {artists.map((artist) => (
            <LibraryArtistSection
              key={artist.id}
              artist={artist}
              releases={releasesByArtist(artist.id)}
              onUnfollow={unfollow}
            />
          ))}
        </div>
      )}
    </div>
  )
}
