import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  [
    'bg-[var(--color-surface)] rounded-[var(--radius-2xl)]',
    'transition-all duration-[var(--duration-base)]',
  ],
  {
    variants: {
      variant: {
        default: 'border border-[var(--color-border)] shadow-[var(--shadow-sm)]',
        elevated: 'shadow-[var(--shadow-md)]',
        flat: 'bg-[var(--color-background)]',
        outlined: 'border border-[var(--color-border)]',
        gradient: 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white border-0',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 active:scale-[0.99]',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-5',
        xl: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  },
)

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

function Card({ className, variant, interactive, padding, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, interactive, padding }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1', className)} {...props} />
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-[var(--text-h3)] font-semibold text-[var(--color-text-primary)] leading-tight', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-[var(--color-text-secondary)]', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between pt-3 border-t border-[var(--color-border)] mt-3', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }
