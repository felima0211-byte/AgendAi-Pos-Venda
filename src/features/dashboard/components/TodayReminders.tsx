'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle2, Clock, ChevronDown } from 'lucide-react'
import { emitRefresh } from '@/lib/refresh-bus'
import type { DashboardData } from '../hooks/use-dashboard'

const LIMIT = 3

async function patchReminder(id: string, body: object) {
  await fetch(`/api/reminders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  emitRefresh()
}

function OverdueCard({ r }: { r: DashboardData['overdueReminders'][number] }) {
  const [snoozOpen, setSnoozOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const complete = async () => {
    setLoading(true)
    await patchReminder(r.id, { action: 'complete' })
  }

  const snooze = async (days: number) => {
    setSnoozOpen(false)
    await patchReminder(r.id, { action: 'snooze', days })
  }

  const label = r.daysOverdue === 1 ? '1 dia atraso' : `${r.daysOverdue}d atraso`

  return (
    <div className="rounded-[var(--radius-lg)] border border-red-100 bg-red-50 overflow-hidden">
      <div className="flex items-center gap-3 px-3 pt-3 pb-2">
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-red-100 flex items-center justify-center shrink-0">
          <Bell size={16} className="text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{r.title}</p>
          <p className="text-xs text-[var(--color-text-subtle)] truncate">{r.clientName}</p>
        </div>
        <span className="text-[11px] font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full shrink-0">
          {label}
        </span>
      </div>

      <div className="flex gap-1.5 px-3 pb-3">
        <button
          onClick={complete}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold active:scale-[0.97] disabled:opacity-50"
        >
          <CheckCircle2 size={13} />
          Concluir
        </button>

        <div className="relative">
          <button
            onClick={() => setSnoozOpen((v) => !v)}
            className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-semibold active:scale-[0.97]"
          >
            <Clock size={13} />
            Adiar
            <ChevronDown size={12} className={snoozOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {snoozOpen && (
            <div className="absolute right-0 bottom-full mb-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg z-10 min-w-[110px] py-1">
              {[1, 3, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => snooze(d)}
                  className="w-full text-left px-3 py-2 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]"
                >
                  +{d} dia{d > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface Props {
  reminders: DashboardData['todayReminders']
  overdueReminders: DashboardData['overdueReminders']
}

export function TodayReminders({ reminders, overdueReminders }: Props) {
  const [expanded, setExpanded] = useState(false)
  const visibleToday = expanded ? reminders : reminders.slice(0, Math.max(0, LIMIT - overdueReminders.length))
  const total = reminders.length + overdueReminders.length
  const hiddenCount = total - overdueReminders.length - visibleToday.length

  if (total === 0) {
    return (
      <div className="px-4 mt-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Lembretes de hoje</h2>
          <Link href="/lembretes" className="text-[13px] font-semibold text-[var(--color-primary)]">Ver todos</Link>
        </div>
        <p className="text-[13px] text-[var(--color-text-secondary)]">Nenhum lembrete para hoje.</p>
      </div>
    )
  }

  const title = overdueReminders.length > 0 ? 'Lembretes pendentes' : 'Lembretes de hoje'

  return (
    <div className="px-4 mt-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
          {overdueReminders.length > 0 && (
            <span className="text-[11px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full leading-none">
              {overdueReminders.length}
            </span>
          )}
        </div>
        <Link href="/lembretes" className="text-[13px] font-semibold text-[var(--color-primary)]">Ver todos</Link>
      </div>

      <div className="flex flex-col gap-2">
        {overdueReminders.map((r) => (
          <OverdueCard key={r.id} r={r} />
        ))}

        {visibleToday.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-3 border border-[var(--color-border)]"
          >
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary-tint)] flex items-center justify-center shrink-0">
              <Bell size={16} className="text-[var(--color-primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{r.title}</p>
              <p className="text-xs text-[var(--color-text-subtle)] truncate">{r.clientName}</p>
            </div>
            <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">{r.dueAt}</span>
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[12px] font-semibold text-[var(--color-primary)]"
        >
          {expanded ? 'Ver menos' : `Ver mais ${hiddenCount}`}
        </button>
      )}
    </div>
  )
}
