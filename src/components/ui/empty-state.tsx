import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12 gap-4',
        className,
      )}
    >
      {icon && (
        <div className="w-16 h-16 flex items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="text-[var(--text-h3)] font-semibold text-[var(--color-text-primary)]">{title}</h3>
        {description && (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {action && (
            <Button onClick={action.onClick} fullWidth>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick} fullWidth>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { EmptyState }
