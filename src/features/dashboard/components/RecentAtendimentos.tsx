'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AudioLines, FileText } from 'lucide-react'
import type { DashboardData } from '../hooks/use-dashboard'

const LIMIT = 3

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso))
}

export function RecentAtendimentos({ items }: { items: DashboardData['recentAtendimentos'] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, LIMIT)
  const canToggle = items.length > LIMIT

  return (
    <div className="px-4 mt-6 animate-slide-up" style={{ animationDelay: '160ms' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Atendimentos recentes
        </h2>
        <Link
          href="/clientes"
          className="text-[13px] font-semibold text-[var(--color-primary)]"
        >
          Ver todos
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Nenhum atendimento ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((a) => {
            const isAudio = a.type === 'AUDIO_NOTE'
            const Icon = isAudio ? AudioLines : FileText
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-3 border border-[var(--color-border)]"
              >
                <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary-tint)] flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                    {a.clientName}
                  </p>
                  <p className="text-xs text-[var(--color-text-subtle)] truncate">
                    {a.summary}
                  </p>
                </div>
                <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">
                  {timeAgo(a.createdAt)}
                </span>
              </div>
            )
          })}
          {canToggle && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 self-start text-[12px] font-semibold text-[var(--color-primary)]"
            >
              {expanded ? 'Ver menos' : `Ver mais ${items.length - LIMIT}`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
