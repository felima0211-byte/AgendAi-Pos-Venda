import { cn } from '@/lib/utils'

type TimelineItemStatus = 'done' | 'current' | 'upcoming'

interface TimelineItem {
  id: string
  title: string
  description?: string
  time?: string
  date?: string
  status?: TimelineItemStatus
  icon?: React.ReactNode
}

interface TimelineCardProps {
  items: TimelineItem[]
  className?: string
}

const STATUS_STYLES: Record<TimelineItemStatus, { dot: string; line: string }> = {
  done: { dot: 'bg-[var(--color-success)] border-[var(--color-success)]', line: 'bg-[var(--color-success)]/30' },
  current: { dot: 'bg-[var(--color-primary)] border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20', line: 'bg-[var(--color-border)]' },
  upcoming: { dot: 'bg-[var(--color-surface)] border-[var(--color-border)]', line: 'bg-[var(--color-border)]' },
}

function TimelineCard({ items, className }: TimelineCardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-2xl)]',
        'border border-[var(--color-border)] shadow-[var(--shadow-sm)]',
        'p-4',
        className,
      )}
    >
      <div className="flex flex-col">
        {items.map((item, idx) => {
          const status = item.status ?? 'upcoming'
          const { dot, line } = STATUS_STYLES[status]
          const isLast = idx === items.length - 1

          return (
            <div key={item.id} className="flex gap-3">
              {/* Indicator */}
              <div className="flex flex-col items-center shrink-0">
                <span className={cn('w-3 h-3 rounded-full border-2 mt-1 shrink-0', dot)} />
                {!isLast && <span className={cn('w-0.5 flex-1 mt-1 mb-1 min-h-4', line)} />}
              </div>

              {/* Content */}
              <div className={cn('flex-1 min-w-0', !isLast && 'pb-4')}>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      'text-sm font-semibold leading-tight',
                      status === 'upcoming'
                        ? 'text-[var(--color-text-tertiary)]'
                        : 'text-[var(--color-text-primary)]',
                    )}
                  >
                    {item.title}
                  </span>
                  {(item.date || item.time) && (
                    <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">
                      {item.time ?? item.date}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { TimelineCard }
export type { TimelineItem }
