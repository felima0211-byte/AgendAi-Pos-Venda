import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva('animate-shimmer rounded-[var(--radius-md)]', {
  variants: {
    variant: {
      default: '',
      circle: 'rounded-full',
      text: 'rounded-[var(--radius-xs)]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
}

function Skeleton({ className, variant, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-2xl)]',
        'border border-[var(--color-border)] p-4',
        'flex items-center gap-3',
        className,
      )}
    >
      <Skeleton variant="circle" width={48} height={48} />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton height={14} width="60%" />
        <Skeleton height={12} width="40%" />
      </div>
    </div>
  )
}

function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonList }
