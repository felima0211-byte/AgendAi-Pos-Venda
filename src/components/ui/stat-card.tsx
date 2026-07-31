import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type TrendDirection = 'up' | 'down' | 'neutral'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  iconColor?: string
  className?: string
}

function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  iconColor = 'var(--color-primary)',
  className,
}: StatCardProps) {
  const direction: TrendDirection =
    trend === undefined || trend === 0 ? 'neutral' : trend > 0 ? 'up' : 'down'

  const TrendIcon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus

  const trendColor =
    direction === 'up'
      ? 'text-[var(--color-success)]'
      : direction === 'down'
        ? 'text-[var(--color-error)]'
        : 'text-[var(--color-text-tertiary)]'

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-2xl)]',
        'border border-[var(--color-border)] shadow-[var(--shadow-sm)]',
        'p-4 flex flex-col gap-3',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</span>
        {icon && (
          <span
            className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)]"
            style={{ backgroundColor: `color-mix(in srgb, ${iconColor} 12%, transparent)`, color: iconColor }}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-[var(--text-h1)] font-bold text-[var(--color-text-primary)] leading-none">
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-[var(--color-text-tertiary)]">{subtitle}</span>
        )}
      </div>

      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
          <TrendIcon size={12} />
          <span>
            {Math.abs(trend)}%{trendLabel ? ` ${trendLabel}` : ''}
          </span>
        </div>
      )}
    </div>
  )
}

export { StatCard }
