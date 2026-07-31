'use client'

import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  CalendarDays,
  BarChart2,
  Settings,
  Zap,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface SidebarItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col',
        'bg-[var(--color-surface)]',
        'border-r border-[var(--color-border)]',
        'transition-all duration-[var(--duration-slow)]',
        collapsed ? 'w-16' : 'w-60',
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] h-14">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-[var(--shadow-primary)]">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-[var(--text-body)] font-semibold text-[var(--color-text-primary)]">
              AgendAI
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors duration-[var(--duration-fast)] ml-auto"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <ChevronLeft
            size={16}
            className={cn('transition-transform duration-[var(--duration-slow)]', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {SIDEBAR_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
                'text-[var(--text-caption)] font-medium',
                'transition-all duration-[var(--duration-fast)]',
                active
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)]',
                collapsed && 'justify-center',
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
