import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  [
    'w-full bg-[var(--color-surface)] text-[var(--color-text-primary)]',
    'border border-[var(--color-border)] rounded-[var(--radius-lg)]',
    'placeholder:text-[var(--color-text-tertiary)]',
    'outline-none transition-all duration-[var(--duration-base)]',
    'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-12 px-4 text-base',
        lg: 'h-14 px-5 text-base',
      },
      hasError: {
        true: 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  hint?: string
  error?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

function Input({
  className,
  size,
  label,
  hint,
  error,
  leftElement,
  rightElement,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftElement && (
          <span className="absolute left-4 text-[var(--color-text-secondary)] pointer-events-none">
            {leftElement}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            inputVariants({ size, hasError: !!error }),
            leftElement && 'pl-10',
            rightElement && 'pr-10',
            className,
          )}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-4 text-[var(--color-text-secondary)]">
            {rightElement}
          </span>
        )}
      </div>
      {(hint || error) && (
        <p className={cn('text-xs', error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-tertiary)]')}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

export { Input, inputVariants }
