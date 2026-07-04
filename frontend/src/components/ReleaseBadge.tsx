import type { ReleaseType } from '@/lib/types'

const STYLES: Record<ReleaseType, string> = {
  ALBUM: 'bg-violet/15 text-violet',
  SINGLE: 'bg-sky-400/15 text-sky-300',
  EP: 'bg-magenta/15 text-magenta',
  COMPILATION: 'bg-surface-3 text-content-muted',
  LIVE: 'bg-surface-3 text-content-muted',
  OTHER: 'bg-surface-3 text-content-muted',
}

export default function ReleaseBadge({ type }: { type: ReleaseType }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${STYLES[type]}`}
    >
      {type}
    </span>
  )
}
