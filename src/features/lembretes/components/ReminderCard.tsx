'use client'

import { useState } from 'react'
import { Check, Clock, X, Sparkles, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { KindBadge } from './KindBadge'
import { MessageGeneratorSheet } from '@/features/mensagens/components/MessageGeneratorSheet'
import type { ReminderKind } from '../hooks/use-reminders'
import type { MessageType } from '@/types/message'
import type { Reminder } from '../hooks/use-reminders'

// Cada tipo de lembrete sugere um tipo de mensagem inicial
const KIND_TO_MESSAGE: Record<ReminderKind, MessageType> = {
  POST_SALE_CHECK: 'POST_SALE',
  EXCHANGE_CHECK: 'POST_SALE',
  RECOMMEND: 'REPURCHASE',
  SIZE_UPDATE: 'REPURCHASE',
  REACTIVATE: 'REMINDER',
  WINBACK: 'REPURCHASE',
  CUSTOM: 'CUSTOM',
}

interface ReminderCardProps {
  reminder: Reminder
  onComplete: (id: string) => void
  onSnooze: (id: string, days: number) => void
  onCancel: (id: string) => void
}

function formatDue(dueAt: string, display: string) {
  const d = new Date(dueAt)
  const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  if (display === 'overdue') {
    const days = Math.floor((Date.now() - d.getTime()) / 86400000)
    return `${dateStr} · ${days === 0 ? 'hoje' : `${days}d atrás`}`
  }
  if (display === 'today') return 'Hoje'
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000)
  return `${dateStr} · em ${days}d`
}

const SNOOZE_OPTIONS = [
  { label: '+1 dia', days: 1 },
  { label: '+3 dias', days: 3 },
  { label: '+7 dias', days: 7 },
]

export function ReminderCard({ reminder, onComplete, onSnooze, onCancel }: ReminderCardProps) {
  const [snoozeOpen, setSnoozeOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const isDone = reminder.displayStatus === 'done'
  const isOverdue = reminder.displayStatus === 'overdue'

  return (
    <div className={cn(
      'bg-white rounded-2xl p-4 border shadow-sm',
      isOverdue ? 'border-red-100' : 'border-gray-100',
      isDone && 'opacity-60'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <KindBadge kind={reminder.kind} />
            <span className={cn(
              'text-[10px] font-medium flex items-center gap-0.5',
              isOverdue ? 'text-red-500' : 'text-gray-400'
            )}>
              <Clock className="w-2.5 h-2.5" />
              {formatDue(reminder.dueAt, reminder.displayStatus)}
            </span>
          </div>

          <p className="text-sm font-semibold text-gray-900">{reminder.client.name}</p>
          <p className="text-sm text-gray-700 mt-0.5">{reminder.title}</p>
          {reminder.body && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{reminder.body}</p>
          )}
        </div>
      </div>

      {!isDone && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onComplete(reminder.id)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5" /> Concluir
          </button>

          <button
            onClick={() => setMessageOpen(true)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-violet-50 text-violet-600 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Mensagem
          </button>

          <div className="relative">
            <button
              onClick={() => setSnoozeOpen((v) => !v)}
              className="flex items-center gap-0.5 py-2 px-3 rounded-xl bg-gray-50 text-gray-500 text-xs font-semibold"
            >
              <Clock className="w-3.5 h-3.5" /> Adiar <ChevronDown className="w-3 h-3" />
            </button>
            {snoozeOpen && (
              <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-28">
                {SNOOZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => { onSnooze(reminder.id, opt.days); setSnoozeOpen(false) }}
                    className="block w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => { onCancel(reminder.id); setSnoozeOpen(false) }}
                  className="flex items-center gap-1 w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                >
                  <X className="w-3 h-3" /> Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <MessageGeneratorSheet
        open={messageOpen}
        clientId={reminder.clientId}
        clientPhone={reminder.client.phone}
        defaultType={KIND_TO_MESSAGE[reminder.kind]}
        reminderId={reminder.id}
        onClose={() => setMessageOpen(false)}
      />
    </div>
  )
}
