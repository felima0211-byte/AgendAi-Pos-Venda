import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
        secondary: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]',
        accent: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
        success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
        warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
        error: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
        neutral: 'bg-[var(--color-background)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
        solid: 'bg-[var(--color-primary)] text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] rounded-[var(--radius-xs)]',
        md: 'px-2.5 py-1 text-xs rounded-[var(--radius-sm)]',
        lg: 'px-3 py-1.5 text-sm rounded-[var(--radius-md)]',
      },
      dot: {
        true: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, dot }), className)} {...props}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
