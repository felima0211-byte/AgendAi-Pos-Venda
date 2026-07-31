'use client'

import { Trash2 } from 'lucide-react'
import { EventBadge } from './EventBadge'
import type { TimelineEvent } from '../hooks/use-timeline'

interface TimelineCardProps {
  event: TimelineEvent
  onDelete?: (id: string) => void
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function TimelineCard({ event, onDelete }: TimelineCardProps) {
  const handleDelete = async () => {
    if (!confirm('Remover este evento da timeline?')) return
    onDelete?.(event.id)
  }

  return (
    <div className="relative pl-8">
      {/* Dot */}
      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-violet-300 border-2 border-white ring-2 ring-violet-100" />

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <EventBadge type={event.type} />
              <span className="text-[10px] text-gray-400">{formatTime(event.createdAt)}</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{event.title}</p>
            {event.body && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-3">{event.body}</p>
            )}
            {event.sale && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                R$ {Number(event.sale.total).toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>

          {onDelete && (
            <button
              onClick={handleDelete}
              className="shrink-0 w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
