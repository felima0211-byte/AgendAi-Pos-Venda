import { SkeletonList } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-background)]">
      <div className="px-4 pt-6 pb-2 animate-pulse">
        <div className="h-7 w-48 bg-[var(--color-border)] rounded-[var(--radius-md)] mb-2" />
        <div className="h-4 w-36 bg-[var(--color-border)] rounded-[var(--radius-sm)]" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-[var(--radius-2xl)] bg-[var(--color-border)] animate-shimmer"
          />
        ))}
      </div>

      {/* Card skeleton */}
      <div className="mx-4 mt-4 h-32 rounded-[var(--radius-2xl)] bg-[var(--color-border)] animate-shimmer" />

      {/* List skeleton */}
      <div className="px-4 mt-6">
        <div className="h-5 w-36 bg-[var(--color-border)] rounded mb-3 animate-pulse" />
        <SkeletonList count={2} />
      </div>
    </div>
  )
}
