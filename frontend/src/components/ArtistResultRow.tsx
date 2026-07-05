import { useState } from 'react'
import { Check, Loader2, Plus, UserRound } from 'lucide-react'
import type { ArtistSearchResult } from '@/lib/types'
import { apiErrorMessage } from '@/lib/api'
import { useToast } from '@/components/toast/useToast'

interface ArtistResultRowProps {
  result: ArtistSearchResult
  followedId: string | undefined
  onFollow: (mbid: string, name: string) => Promise<void>
  onUnfollow: (id: string) => Promise<void>
}

/** Ligne de résultat de recherche avec bouton Follow / Following (toggle). */
export default function ArtistResultRow({
  result,
  followedId,
  onFollow,
  onUnfollow,
}: ArtistResultRowProps) {
  const [pending, setPending] = useState(false)
  const toast = useToast()
  const isFollowing = followedId !== undefined

  async function toggle() {
    setPending(true)
    try {
      if (followedId !== undefined) {
        await onUnfollow(followedId)
        toast.info(`Vous ne suivez plus ${result.name}`)
      } else {
        await onFollow(result.mbid, result.name)
        toast.success(`Vous suivez ${result.name}`)
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Action impossible'))
    } finally {
      setPending(false)
    }
  }

  return (
    <li className="border-line bg-surface hover:bg-surface-2 flex items-center gap-4 rounded-[var(--radius-card)] border p-4 transition-colors">
      <div className="bg-surface-3 text-content-subtle flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
        <UserRound className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-content truncate font-semibold">{result.name}</p>
        {result.disambiguation && (
          <p className="text-content-subtle truncate text-sm">{result.disambiguation}</p>
        )}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
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
    </li>
  )
}
