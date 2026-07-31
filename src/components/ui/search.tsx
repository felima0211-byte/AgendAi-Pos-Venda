'use client'

import { Search as SearchIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  containerClassName?: string
}

function Search({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  containerClassName,
  className,
  ...props
}: SearchProps) {
  const [localValue, setLocalValue] = useState(value ?? '')
  const controlled = value !== undefined
  const current = controlled ? value : localValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setLocalValue(e.target.value)
    onChange?.(e.target.value)
  }

  const handleClear = () => {
    if (!controlled) setLocalValue('')
    onChange?.('')
    onClear?.()
  }

  return (
    <div className={cn('relative flex items-center w-full', containerClassName)}>
      <SearchIcon
        size={18}
        className="absolute left-4 text-[var(--color-text-tertiary)] pointer-events-none"
      />
      <input
        type="search"
        value={current}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full h-11 pl-11 pr-10',
          'bg-[var(--color-surface)] text-[var(--color-text-primary)]',
          'border border-[var(--color-border)] rounded-[var(--radius-full)]',
          'placeholder:text-[var(--color-text-tertiary)]',
          'outline-none transition-all duration-[var(--duration-base)]',
          'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10',
          'text-base',
          className,
        )}
        {...props}
      />
      {current && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-strong)] transition-colors"
          aria-label="Limpar busca"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

export { Search }
