import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Disc3, Loader2, Plus, UserRound } from 'lucide-react'
import type { Artist, Release } from '@/lib/types'
import { apiErrorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { useFollowedArtists } from '@/lib/useFollowedArtists'
import { useToast } from '@/components/toast/useToast'
import ReleaseCard from '@/components/ReleaseCard'
import ReleaseCardSkeleton from '@/components/ReleaseCardSkeleton'
import EmptyState from '@/components/EmptyState'

const SKELETONS = ['s1', 's2', 's3', 's4']

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>()
  const toast = useToast()
  const releases = useApi<Release[]>('/releases')
  const { artists, loading, followedId, follow, unfollow } = useFollowedArtists()

  // On capture l'artiste au premier chargement pour que la page reste utilisable
  // même après un unfollow (il disparaît alors de la liste des suivis).
  const [artist, setArtist] = useState<Artist | null>(null)
  useEffect(() => {
    if (!artist) {
      const found = artists.find((a) => a.id === id)
      if (found) setArtist(found)
    }
  }, [artists, id, artist])

  const [pending, setPending] = useState(false)

  if (loading && !artist) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="flex animate-pulse items-center gap-6">
          <div className="bg-surface-2 h-28 w-28 rounded-full" />
          <div className="space-y-3">
            <div className="bg-surface-2 h-8 w-56 rounded" />
            <div className="bg-surface-2 h-9 w-32 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">
        <EmptyState
          icon={UserRound}
          title="Artiste introuvable"
          message="Cet artiste ne fait pas partie de vos suivis."
          action={
            <Link
              to="/library"
              className="bg-surface-2 hover:bg-surface-3 text-content rounded-lg px-4 py-2 text-sm font-medium transition"
            >
              Retour à la Library
            </Link>
          }
        />
      </div>
    )
  }

  const currentId = followedId(artist.mbid)
  const isFollowing = currentId !== undefined
  const discography = releases.data?.filter((r) => r.artistId === artist.id) ?? []

  async function toggle() {
    if (!artist) return
    setPending(true)
    try {
      if (currentId !== undefined) {
        await unfollow(currentId)
        toast.info(`Vous ne suivez plus ${artist.name}`)
      } else {
        await follow(artist.mbid, artist.name)
        toast.success(`Vous suivez ${artist.name}`)
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Action impossible'))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <Link
        to="/library"
        className="text-content-subtle hover:text-content mb-8 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Library
      </Link>

      <header className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="gradient-brand flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-5xl font-bold text-white">
          {artist.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <h1 className="text-content text-3xl font-extrabold tracking-tight md:text-4xl">
            {artist.name}
          </h1>
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-60 ${
              isFollowing
                ? 'bg-surface-3 text-content-muted hover:text-content'
                : 'gradient-brand text-white hover:opacity-95'
            }`}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-content mb-5 text-2xl font-bold">Discographie</h2>

        {releases.loading && (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {SKELETONS.map((key) => (
              <ReleaseCardSkeleton key={key} />
            ))}
          </div>
        )}

        {!releases.loading && discography.length === 0 && (
          <EmptyState
            icon={Disc3}
            title="Aucune sortie synchronisée"
            message="Les sorties de cet artiste apparaîtront après la prochaine synchronisation."
          />
        )}

        {!releases.loading && discography.length > 0 && (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {discography.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
