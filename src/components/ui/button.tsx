import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold text-base leading-none',
    'rounded-[var(--radius-lg)]',
    'transition-all duration-[var(--duration-base)]',
    'select-none cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'active:scale-[0.97]',
    'outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-primary)] text-white',
          'shadow-[var(--shadow-primary)]',
          'hover:bg-[var(--color-primary-dark)]',
        ],
        secondary: [
          'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]',
          'hover:bg-[var(--color-secondary)]/20',
        ],
        accent: [
          'bg-[var(--color-accent)] text-white',
          'shadow-[var(--shadow-accent)]',
          'hover:brightness-95',
        ],
        outline: [
          'bg-transparent border border-[var(--color-border)]',
          'text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-background)] hover:border-[var(--color-border-strong)]',
        ],
        ghost: [
          'bg-transparent text-[var(--color-text-secondary)]',
          'hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)]',
        ],
        destructive: [
          'bg-red-500 text-white hover:bg-red-600',
        ],
        gradient: [
          'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white',
          'shadow-[var(--shadow-primary)] hover:brightness-105',
        ],
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-[var(--radius-md)]',
        md: 'h-12 px-6',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 rounded-[var(--radius-md)]',
        'icon-sm': 'h-8 w-8 rounded-[var(--radius-sm)]',
        'icon-lg': 'h-12 w-12 rounded-[var(--radius-lg)]',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}

export { Button, buttonVariants }
