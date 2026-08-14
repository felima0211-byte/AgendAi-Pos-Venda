'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, X, AlertCircle, Clock, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  clientName: string
  dueAt: string
  overdue: boolean
}

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
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/notificacoes')
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  async function handleOpen() {
    setOpen((v) => !v)
    if (!open && notifications.length === 0) {
      setLoading(true)
      try {
        const r = await fetch('/api/notificacoes')
        const d = await r.json()
        setNotifications(d.notifications ?? [])
        setCount(d.count ?? 0)
      } finally {
        setLoading(false)
      }
    }
  }

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
            <div className="relative" ref={panelRef}>
              <button
                onClick={handleOpen}
                aria-label="Notificações"
                className="relative w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors duration-[var(--duration-fast)]"
              >
                <Bell size={20} />
                {count > 0 ? (
                  <span
                    className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white"
                    style={{
                      minWidth: 14,
                      height: 14,
                      paddingInline: 3,
                      backgroundColor: 'var(--color-accent)',
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                ) : (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                )}
              </button>

              {open && (
                <div
                  className="absolute right-0 top-11 z-50 rounded-2xl border shadow-lg"
                  style={{
                    width: 300,
                    maxHeight: 400,
                    overflowY: 'auto',
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      Notificações
                    </span>
                    <button onClick={() => setOpen(false)}>
                      <X size={16} style={{ color: 'var(--color-text-secondary)' }} />
                    </button>
                  </div>

                  <div className="flex flex-col">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div
                          className="w-5 h-5 animate-spin rounded-full border-2 border-t-transparent"
                          style={{ borderColor: 'var(--color-accent)' }}
                        />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
                        <Bell size={28} style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Nenhum lembrete pendente para hoje
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href="/lembretes"
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-[var(--color-background)]"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.overdue ? (
                              <AlertCircle size={16} style={{ color: '#C4342F' }} />
                            ) : (
                              <Clock size={16} style={{ color: '#C46A1F' }} />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                              {n.title}
                            </span>
                            <span className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                              {n.clientName} · {new Date(n.dueAt).toLocaleDateString('pt-BR')}
                            </span>
                            {n.overdue && (
                              <span className="text-xs font-semibold" style={{ color: '#C4342F' }}>
                                Em atraso
                              </span>
                            )}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-3">
                      <Link
                        href="/lembretes"
                        onClick={() => setOpen(false)}
                        className="block text-center text-xs font-semibold"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        Ver todos os lembretes
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {rightSlot}
        </div>
      </div>
    </header>
  )
}
