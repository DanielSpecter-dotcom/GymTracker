export function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-steel-3 bg-steel">
      <div className="flex">
        <span className="w-1.5 shrink-0 bg-steel-3" />
        <div className="flex-1 space-y-3 p-4">
          <div className="h-5 w-2/5 rounded bg-steel-3" />
          <div className="h-3 w-1/4 rounded bg-steel-3" />
          <div className="h-9 rounded-lg bg-steel-3" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-xl border border-steel-3 bg-steel p-3.5">
      <div className="h-4 w-1/2 rounded bg-steel-3" />
      <div className="mt-2 h-3 w-1/4 rounded bg-steel-3" />
    </div>
  )
}

export function SkeletonList({ count, variant = 'card' }: { count: number; variant?: 'card' | 'row' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) =>
        variant === 'card' ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />,
      )}
    </div>
  )
}
