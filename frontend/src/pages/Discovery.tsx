import { type FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Search, SearchX } from 'lucide-react'
import type { ArtistSearchResult } from '@/lib/types'
import { api, apiErrorMessage } from '@/lib/api'
import { useDebounce } from '@/lib/useDebounce'
import { useFollowedArtists } from '@/lib/useFollowedArtists'
import ArtistResultRow from '@/components/ArtistResultRow'
import EmptyState from '@/components/EmptyState'

const MIN_QUERY_LENGTH = 2

export default function Discovery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput] = useState(() => searchParams.get('q') ?? '')
  const debounced = useDebounce(input.trim(), 350)

  const [results, setResults] = useState<ArtistSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryNonce, setRetryNonce] = useState(0)

  const { followedId, follow, unfollow } = useFollowedArtists()

  // Réagir à une recherche lancée depuis la Topbar pendant que la page est montée.
  const urlQuery = searchParams.get('q') ?? ''
  useEffect(() => {
    setInput((cur) => (cur.trim() === urlQuery ? cur : urlQuery))
  }, [urlQuery])

  // Refléter la requête (débouncée) dans l'URL (partageable, aligné sur la Topbar).
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (debounced) next.set('q', debounced)
        else next.delete('q')
        return next
      },
      { replace: true },
    )
  }, [debounced, setSearchParams])

  // Recherche MusicBrainz (ignore les réponses obsolètes).
  useEffect(() => {
    if (debounced.length < MIN_QUERY_LENGTH) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const response = await api.get<ArtistSearchResult[]>('/artists/search', {
          params: { q: debounced },
        })
        if (active) setResults(response.data)
      } catch (err) {
        if (active) setError(apiErrorMessage(err, 'La recherche a échoué'))
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [debounced, retryNonce])

  function onSubmit(event: FormEvent) {
    event.preventDefault()
  }

  const tooShort = debounced.length < MIN_QUERY_LENGTH

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
      <header className="mb-8">
        <h1 className="text-content text-3xl font-bold">Discovery</h1>
        <p className="text-content-subtle mt-1">
          Recherchez un artiste et suivez-le pour être notifié de ses sorties.
        </p>
      </header>

      <form onSubmit={onSubmit} className="relative">
        <Search className="text-content-subtle pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Rechercher un artiste…"
          className="bg-surface border-line text-content placeholder:text-content-subtle focus:border-accent w-full rounded-full border py-3.5 pr-4 pl-12 text-sm transition-colors outline-none"
        />
      </form>

      <div className="mt-8">
        {tooShort && (
          <p className="text-content-subtle text-center text-sm">
            Saisissez au moins {MIN_QUERY_LENGTH} caractères pour lancer la recherche.
          </p>
        )}

        {!tooShort && loading && (
          <ul className="flex flex-col gap-3">
            {['r1', 'r2', 'r3', 'r4', 'r5'].map((key) => (
              <li
                key={key}
                className="border-line bg-surface flex animate-pulse items-center gap-4 rounded-[var(--radius-card)] border p-4"
              >
                <div className="bg-surface-3 h-12 w-12 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="bg-surface-3 h-4 w-1/3 rounded" />
                  <div className="bg-surface-3 h-3 w-1/2 rounded" />
                </div>
                <div className="bg-surface-3 h-9 w-24 rounded-full" />
              </li>
            ))}
          </ul>
        )}

        {!tooShort && !loading && error && (
          <EmptyState
            icon={AlertTriangle}
            title="Recherche impossible"
            message={error}
            action={
              <button
                type="button"
                onClick={() => setRetryNonce((n) => n + 1)}
                className="bg-surface-2 hover:bg-surface-3 text-content rounded-lg px-4 py-2 text-sm font-medium transition"
              >
                Réessayer
              </button>
            }
          />
        )}

        {!tooShort && !loading && !error && results.length === 0 && (
          <EmptyState
            icon={SearchX}
            title="Aucun artiste trouvé"
            message={`Aucun résultat pour « ${debounced} ». Vérifiez l'orthographe.`}
          />
        )}

        {!tooShort && !loading && !error && results.length > 0 && (
          <ul className="flex flex-col gap-3">
            {results.map((result) => (
              <ArtistResultRow
                key={result.mbid}
                result={result}
                followedId={followedId(result.mbid)}
                onFollow={follow}
                onUnfollow={unfollow}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
