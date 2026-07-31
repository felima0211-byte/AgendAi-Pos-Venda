'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import type { DashboardData } from '../hooks/use-dashboard'

const LIMIT = 3

export function TodayReminders({ reminders }: { reminders: DashboardData['todayReminders'] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? reminders : reminders.slice(0, LIMIT)
  const canToggle = reminders.length > LIMIT

  return (
    <div className="px-4 mt-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Lembretes de hoje
        </h2>
        <Link
          href="/lembretes"
          className="text-[13px] font-semibold text-[var(--color-primary)]"
        >
          Ver todos
        </Link>
      </div>

      {reminders.length === 0 ? (
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Nenhum lembrete para hoje.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {visible.map((r) => (
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
          {canToggle && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-[12px] font-semibold text-[var(--color-primary)]"
            >
              {expanded ? 'Ver menos' : `Ver mais ${reminders.length - LIMIT}`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
