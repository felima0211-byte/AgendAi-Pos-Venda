import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

function SectionTitle({ title, subtitle, action, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-end justify-between', className)}>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[var(--text-h3)] font-semibold text-[var(--color-text-primary)] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export { SectionTitle }
