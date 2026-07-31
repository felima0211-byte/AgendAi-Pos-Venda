'use client'

import { Bell, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title?: string
  subtitle?: string
  showSearch?: boolean
  showNotification?: boolean
  className?: string
  rightSlot?: React.ReactNode
}

export function TopBar({
  title = 'AgendAI',
  subtitle,
  showSearch = false,
  showNotification = true,
  className,
  rightSlot,
}: TopBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-[200] w-full',
        'bg-[var(--color-surface)]/90 backdrop-blur-md',
        'border-b border-[var(--color-border)]',
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left */}
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[var(--text-h3)] font-semibold text-[var(--color-text-primary)] leading-tight truncate">
            {title}
          </span>
          {subtitle && (
            <span className="text-[var(--text-caption)] text-[var(--color-text-secondary)] leading-tight truncate">
              {subtitle}
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 shrink-0 ml-3">
          {showSearch && (
            <button
              aria-label="Buscar"
              className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors duration-[var(--duration-fast)]"
            >
              <Search size={20} />
            </button>
          )}
          {showNotification && (
            <button
              aria-label="Notificações"
              className="relative w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors duration-[var(--duration-fast)]"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            </button>
          )}
          {rightSlot}
        </div>
      </div>
    </header>
  )
}
