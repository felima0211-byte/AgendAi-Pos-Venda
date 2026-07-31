import { cn } from '@/lib/utils'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

function TextArea({
  className,
  label,
  hint,
  error,
  id,
  rows = 4,
  ...props
}: TextAreaProps) {
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
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 resize-none',
          'bg-[var(--color-surface)] text-[var(--color-text-primary)]',
          'border border-[var(--color-border)] rounded-[var(--radius-lg)]',
          'placeholder:text-[var(--color-text-tertiary)]',
          'outline-none transition-all duration-[var(--duration-base)]',
          'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'text-base',
          error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10',
          className,
        )}
        {...props}
      />
      {(hint || error) && (
        <p className={cn('text-xs', error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-tertiary)]')}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

export { TextArea }
