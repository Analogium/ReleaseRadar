import type { Release } from '@/lib/types'
import CoverArt from './CoverArt'
import ReleaseBadge from './ReleaseBadge'
import { formatReleaseDate, isRecentRelease } from '@/lib/format'

export default function ReleaseCard({ release }: { release: Release }) {
  const recent = isRecentRelease(release.releaseDate)

  return (
    <article className="group">
      <div className="border-line relative aspect-square overflow-hidden rounded-[var(--radius-card)] border transition-transform group-hover:scale-[1.02]">
        <CoverArt mbid={release.mbid} alt={release.title} />
        {recent && (
          <span className="gradient-brand absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
            NEW
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <ReleaseBadge type={release.type} />
        <span className="text-content-subtle text-xs">
          {formatReleaseDate(release.releaseDate)}
        </span>
      </div>
      <h3 className="text-content mt-1 truncate font-semibold">{release.title}</h3>
      <p className="text-content-subtle truncate text-sm">{release.artistName}</p>
    </article>
  )
}
