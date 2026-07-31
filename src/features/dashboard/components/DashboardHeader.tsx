'use client'

import { Bell } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useDashboard } from '../hooks/use-dashboard'

function getFormattedDate() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

export function DashboardHeader() {
  const { greeting, firstName } = useCurrentUser()
  const { data } = useDashboard()

  // Notificações = lembretes pendentes de hoje/atrasados
  const notifications = data.stats.lembretes.total

  const date = getFormattedDate()
  const [weekday, ...rest] = date.split(', ')
  const formattedDate = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${rest.join(', ')}`

  return (
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
        aria-label="Notificações"
        className="relative w-10 h-10 flex items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-primary)] active:bg-black/5 transition-colors"
      >
        <Bell size={22} />
        {notifications > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center">
            {notifications > 9 ? '9+' : notifications}
          </span>
        )}
      </button>
    </div>
  )
}
