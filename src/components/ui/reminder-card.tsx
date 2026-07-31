import { cn } from '@/lib/utils'
import { Bell, Clock, CheckCircle2, Circle } from 'lucide-react'
import { Badge } from './badge'

type ReminderPriority = 'low' | 'medium' | 'high'

const PRIORITY_MAP: Record<
  ReminderPriority,
  { label: string; variant: 'neutral' | 'warning' | 'error'; color: string }
> = {
  low: { label: 'Baixa', variant: 'neutral', color: 'var(--color-text-tertiary)' },
  medium: { label: 'Média', variant: 'warning', color: 'var(--color-warning)' },
  high: { label: 'Alta', variant: 'error', color: 'var(--color-error)' },
}

interface ReminderCardProps {
  title: string
  description?: string
  time?: string
  date?: string
  priority?: ReminderPriority
  done?: boolean
  clientName?: string
  className?: string
  onToggle?: () => void
  onPress?: () => void
}

function ReminderCard({
  title,
  description,
  time,
  date,
  priority = 'medium',
  done = false,
  clientName,
  className,
  onToggle,
  onPress,
}: ReminderCardProps) {
  const { label, variant } = PRIORITY_MAP[priority]

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-2xl)]',
        'border border-[var(--color-border)] shadow-[var(--shadow-sm)]',
        'p-4 flex gap-3',
        'transition-all duration-[var(--duration-base)]',
        done && 'opacity-60',
        onPress && 'cursor-pointer hover:shadow-[var(--shadow-md)] active:scale-[0.99]',
        className,
      )}
      onClick={onPress}
    >
      {/* Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle?.() }}
        className="shrink-0 mt-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
        aria-label={done ? 'Marcar como pendente' : 'Marcar como feito'}
      >
        {done ? (
          <CheckCircle2 size={20} className="text-[var(--color-success)]" />
        ) : (
          <Circle size={20} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={cn('font-semibold text-[var(--color-text-primary)] truncate', done && 'line-through')}>
            {title}
          </span>
          <Badge variant={variant} size="sm">{label}</Badge>
        </div>
        {description && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-2 line-clamp-2">{description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
          {(date || time) && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {date}{date && time ? ' • ' : ''}{time}
            </span>
          )}
          {clientName && (
            <span className="flex items-center gap-1">
              <Bell size={11} />
              {clientName}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export { ReminderCard }
