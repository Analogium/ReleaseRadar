/** Placeholder animé d'une ReleaseCard pendant le chargement. */
export default function ReleaseCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-surface-2 aspect-square rounded-[var(--radius-card)]" />
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="bg-surface-2 h-4 w-14 rounded-full" />
        <div className="bg-surface-2 h-3 w-16 rounded" />
      </div>
      <div className="bg-surface-2 mt-2 h-4 w-3/4 rounded" />
      <div className="bg-surface-2 mt-2 h-3 w-1/2 rounded" />
    </div>
  )
}
