import { useCallback, useEffect, useState } from 'react'
import type { Artist } from './types'
import { api, apiErrorMessage } from './api'

interface UseFollowedArtists {
  artists: Artist[]
  loading: boolean
  error: string | null
  /** id de l'artiste suivi correspondant au `mbid`, ou `undefined` si non suivi. */
  followedId: (mbid: string) => string | undefined
  follow: (mbid: string, name: string) => Promise<void>
  unfollow: (id: string) => Promise<void>
  reload: () => void
}

/**
 * Source de vérité des artistes suivis (`GET /api/artists`) + actions follow/unfollow.
 * Partagée par Discovery (10.5) et Library (10.6) : `followedId(mbid)` permet de
 * savoir si un résultat de recherche est déjà suivi et de retrouver son id pour l'unfollow.
 */
export function useFollowedArtists(): UseFollowedArtists {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<Artist[]>('/artists')
      setArtists(response.data)
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les artistes suivis'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const followedId = useCallback(
    (mbid: string) => artists.find((a) => a.mbid === mbid)?.id,
    [artists],
  )

  const follow = useCallback(async (mbid: string, name: string) => {
    const { data } = await api.post<Artist>('/artists', { mbid, name })
    setArtists((prev) => (prev.some((a) => a.mbid === mbid) ? prev : [...prev, data]))
  }, [])

  const unfollow = useCallback(async (id: string) => {
    await api.delete(`/artists/${id}`)
    setArtists((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { artists, loading, error, followedId, follow, unfollow, reload: () => void load() }
}
