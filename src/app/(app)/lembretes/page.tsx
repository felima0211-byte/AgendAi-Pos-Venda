'use client'

import { useState } from 'react'
import { Bell, CheckCircle2 } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { ReminderCard } from '@/features/lembretes/components/ReminderCard'
import { useReminders } from '@/features/lembretes/hooks/use-reminders'
import { cn } from '@/utils/cn'

type Tab = 'today' | 'overdue' | 'upcoming' | 'done'

const TABS: { key: Tab; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'overdue', label: 'Atrasados' },
  { key: 'upcoming', label: 'Próximos' },
  { key: 'done', label: 'Concluídos' },
]

export default function LembretesPage() {
  const { buckets, counts, loading, complete, snooze, cancel } = useReminders()
  const [tab, setTab] = useState<Tab>('today')

  const list = buckets[tab]

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-violet-600" />
          <h1 className="text-lg font-bold text-gray-900">Pós-venda</h1>
        </div>
        <p className="text-xs text-gray-400">
          {counts.pending} {counts.pending === 1 ? 'acompanhamento pendente' : 'acompanhamentos pendentes'}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {TABS.map(({ key, label }) => {
            const count = counts[key]
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
                  active ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                )}
              >
                {label}
                {count > 0 && (
                  <span className={cn(
                    'text-[10px] px-1.5 rounded-full',
                    active ? 'bg-white/25' : key === 'overdue' ? 'bg-red-100 text-red-500' : 'bg-white'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista */}
      <main className="flex-1 px-4 pt-4 pb-24 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-violet-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {tab === 'today' ? 'Nada para hoje' :
               tab === 'overdue' ? 'Nenhum atrasado' :
               tab === 'upcoming' ? 'Nenhum próximo' : 'Nenhum concluído ainda'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Os lembretes de pós-venda aparecem aqui automaticamente após cada atendimento.
            </p>
          </div>
        )}

        {!loading && list.map((reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onComplete={complete}
            onSnooze={snooze}
            onCancel={cancel}
          />
        ))}
      </main>

      <BottomNav />
    </div>
  )
}
