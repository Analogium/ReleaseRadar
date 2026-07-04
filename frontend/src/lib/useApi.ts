import { useCallback, useEffect, useState } from 'react'
import { api, apiErrorMessage } from './api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * Récupère une ressource GET au montage et expose `data / loading / error`,
 * plus un `reload()` (utile après un follow/unfollow). Le `path` est passé tel
 * quel à axios (baseURL = `/api`), ex. `useApi<Release[]>('/releases')`.
 */
export function useApi<T>(path: string): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<T>(path)
      setData(response.data)
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les données'))
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    void load()
  }, [load])

  return { data, loading, error, reload: () => void load() }
}
