'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, X, Home, Users, CalendarDays, Zap, LogOut, UserCircle } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useDashboard } from '../hooks/use-dashboard'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/lembretes', label: 'Pós Venda', icon: CalendarDays },
  { href: '/vendamais', label: 'Venda+', icon: Zap },
]

function getFormattedDate() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

export function DashboardHeader() {
  const { greeting, firstName, displayName, email, avatarUrl, signOut } = useCurrentUser()
  const { data } = useDashboard()
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const date = getFormattedDate()
  const [weekday, ...rest] = date.split(', ')
  const formattedDate = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${rest.join(', ')}`

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  useEffect(() => {
    if (!menuOpen) return
    function handle(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  return (
    <>
      <div className="flex items-start justify-between px-4 pt-6 pb-3 animate-slide-down">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[18px] font-bold text-[var(--color-text-primary)] leading-tight">
            {greeting}, {firstName ?? 'Você'}! 👋
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] capitalize">
            {formattedDate}
          </p>
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
          className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-primary)] hover:bg-[var(--color-background)] active:bg-black/5 transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[300] bg-black/30 backdrop-blur-sm transition-opacity duration-300',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed top-0 right-0 bottom-0 z-[400] w-72 flex flex-col',
          'bg-[var(--color-surface)] border-l border-[var(--color-border)]',
          'transition-transform duration-300',
          menuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border)] shrink-0">
          <span className="font-semibold text-sm text-[var(--color-text-primary)]">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <UserCircle size={22} className="text-[var(--color-primary)]" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{displayName ?? 'Usuário'}</span>
              {email && <span className="text-xs text-[var(--color-text-subtle)] truncate">{email}</span>}
            </div>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150',
                isActive(href)
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-body)] hover:bg-[var(--color-background)]',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--color-border)] shrink-0">
          <button
            onClick={() => { setMenuOpen(false); signOut() }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/8 transition-colors duration-150"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    </>
  )
}
