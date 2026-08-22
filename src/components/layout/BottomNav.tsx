'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Home, Users, CalendarDays, Zap, Mic } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { RegistrarAtendimentoSheet } from '@/features/atendimento/components/RegistrarAtendimentoSheet'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const LEFT_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/clientes', label: 'Clientes', icon: Users },
]

const RIGHT_ITEMS: NavItem[] = [
  { href: '/lembretes', label: 'Pós Venda', icon: CalendarDays },
  { href: '/vendamais', label: 'Venda+', icon: Zap },
]

interface BottomNavProps {
  onMicPress?: () => void
  className?: string
}

export function BottomNav({ onMicPress, className }: BottomNavProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  // Mic ativo em qualquer tela: sem callback específico, o FAB abre a escolha áudio/texto
  const handleMicPress = onMicPress ?? (() => setSheetOpen(true))

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const NavLink = ({ href, label, icon: Icon }: NavItem) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 px-1',
          'transition-colors duration-[var(--duration-fast)]',
          active
            ? 'text-[var(--color-primary)]'
            : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
        )}
      >
        <span
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-[var(--radius-sm)] transition-all duration-[var(--duration-base)]',
            active && 'bg-[var(--color-primary)]/10 scale-110',
          )}
        >
          <Icon size={20} />
        </span>
        <span
          className={cn(
            'text-[10px] font-medium leading-none transition-all duration-[var(--duration-base)]',
            active ? 'opacity-100' : 'opacity-60',
          )}
        >
          {label}
        </span>
      </Link>
    )
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[200]',
        'bg-[var(--color-surface)]/95 backdrop-blur-md',
        'border-t border-[var(--color-border)]',
        className,
      )}
    >
      <div className="flex items-center justify-around px-2 h-16 relative">
        {LEFT_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {/* FAB central */}
        <div className="flex flex-col items-center justify-center flex-1">
          <button
            onClick={handleMicPress}
            aria-label="Gravar atendimento"
            className={cn(
              'absolute -top-6 w-14 h-14 rounded-full',
              'bg-[var(--color-primary)] shadow-[var(--shadow-primary)]',
              'flex items-center justify-center',
              'transition-transform duration-[var(--duration-base)] active:scale-95',
              'hover:bg-[var(--color-primary-dark)]',
            )}
          >
            <Mic size={24} className="text-white" />
          </button>
        </div>

        {RIGHT_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />

      <RegistrarAtendimentoSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </nav>
  )
}
