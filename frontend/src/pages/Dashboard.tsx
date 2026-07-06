import { Link } from 'react-router-dom'
import { AlertTriangle, Disc3, UserPlus, Users } from 'lucide-react'
import type { Artist, Release } from '@/lib/types'
import { useApi } from '@/lib/useApi'
import { dedupeByMbid } from '@/lib/roles'
import ReleaseCard from '@/components/ReleaseCard'
import ReleaseCardSkeleton from '@/components/ReleaseCardSkeleton'
import ArtistCard from '@/components/ArtistCard'
import EmptyState from '@/components/EmptyState'

const RELEASE_SKELETONS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']
const ARTIST_SKELETONS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']

export default function Dashboard() {
  const releases = useApi<Release[]>('/releases')
  const artists = useApi<Artist[]>('/artists')

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <header>
        <p className="text-accent text-xs font-bold tracking-widest uppercase">Curated for you</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Weekend Discovery <span className="text-gradient-brand">Radar</span>
        </h1>
      </header>

      {/* Latest Releases */}
      <section className="mt-12">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-content text-2xl font-bold">Latest Releases</h2>
          <Link to="/discovery" className="text-content-subtle hover:text-content text-sm">
            Find more
          </Link>
        </div>

        {releases.loading && (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {RELEASE_SKELETONS.map((key) => (
              <ReleaseCardSkeleton key={key} />
            ))}
          </div>
        )}

        {!releases.loading && releases.error && (
          <EmptyState
            icon={AlertTriangle}
            title="Chargement impossible"
            message={releases.error}
            action={
              <button
                type="button"
                onClick={releases.reload}
                className="bg-surface-2 hover:bg-surface-3 text-content rounded-lg px-4 py-2 text-sm font-medium transition"
              >
                Réessayer
              </button>
            }
          />
        )}

        {!releases.loading && !releases.error && releases.data?.length === 0 && (
          <EmptyState
            icon={Disc3}
            title="Aucune sortie pour l'instant"
            message="Suivez des artistes pour voir leurs dernières sorties apparaître ici."
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

        {!releases.loading && !releases.error && releases.data && releases.data.length > 0 && (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {dedupeByMbid(releases.data).map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>
        )}
      </section>

      {/* Artists You Follow */}
      <section className="mt-14">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-content text-2xl font-bold">Artists You Follow</h2>
          <Link to="/library" className="text-content-subtle hover:text-content text-sm">
            View library
          </Link>
        </div>

        {artists.loading && (
          <div className="flex gap-6">
            {ARTIST_SKELETONS.map((key) => (
              <div
                key={key}
                className="flex w-24 shrink-0 animate-pulse flex-col items-center gap-2"
              >
                <div className="bg-surface-2 h-24 w-24 rounded-full" />
                <div className="bg-surface-2 h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        )}

        {!artists.loading && artists.error && (
          <EmptyState
            icon={AlertTriangle}
            title="Chargement impossible"
            message={artists.error}
            action={
              <button
                type="button"
                onClick={artists.reload}
                className="bg-surface-2 hover:bg-surface-3 text-content rounded-lg px-4 py-2 text-sm font-medium transition"
              >
                Réessayer
              </button>
            }
          />
        )}

        {!artists.loading && !artists.error && artists.data?.length === 0 && (
          <EmptyState
            icon={Users}
            title="Vous ne suivez aucun artiste"
            message="Recherchez vos artistes préférés pour être notifié de leurs nouvelles sorties."
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

        {!artists.loading && !artists.error && artists.data && artists.data.length > 0 && (
          <div className="flex gap-6 overflow-x-auto pb-2">
            {artists.data.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
