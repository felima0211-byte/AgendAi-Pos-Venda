'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Users, CalendarDays, Zap, LogOut, UserCircle, Search, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/use-current-user'
import { usePathname, useRouter } from 'next/navigation'

const ROOT_PATHS = ['/dashboard', '/clientes', '/lembretes', '/vendamais', '/mais', '/assistente']

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/lembretes', label: 'Pós Venda', icon: CalendarDays },
  { href: '/vendamais', label: 'Venda+', icon: Zap },
]

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
  className,
  rightSlot,
}: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { displayName, email, avatarUrl, signOut } = useCurrentUser()

  const isRoot = ROOT_PATHS.some((p) => pathname === p)

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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[200] w-full',
          'bg-[var(--color-surface)]/90 backdrop-blur-md',
          'border-b border-[var(--color-border)]',
          className,
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 gap-2">
          {/* Left — back button ou título */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {!isRoot && (
              <button
                onClick={() => router.back()}
                aria-label="Voltar"
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors duration-[var(--duration-fast)] -ml-1"
              >
                <ChevronLeft size={22} />
              </button>
            )}
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
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 shrink-0">
            {showSearch && (
              <button
                aria-label="Buscar"
                className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors duration-[var(--duration-fast)]"
              >
                <Search size={20} />
              </button>
            )}

            {rightSlot}

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
              className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors duration-[var(--duration-fast)]"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[300] bg-black/30 backdrop-blur-sm transition-opacity duration-[var(--duration-slow)]',
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
          'transition-transform duration-[var(--duration-slow)]',
          menuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border)] shrink-0">
          <span className="font-semibold text-sm text-[var(--color-text-primary)]">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Perfil */}
        <div className="px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <UserCircle size={22} className="text-[var(--color-primary)]" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {displayName ?? 'Usuário'}
              </span>
              {email && (
                <span className="text-xs text-[var(--color-text-subtle)] truncate">
                  {email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-[var(--duration-fast)]',
                  active
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-[var(--color-text-body)] hover:bg-[var(--color-background)]',
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sair */}
        <div className="px-3 py-4 border-t border-[var(--color-border)] shrink-0">
          <button
            onClick={() => { setMenuOpen(false); signOut() }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/8 transition-colors duration-[var(--duration-fast)]"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    </>
  )
}
