'use client'

import { useEffect, useMemo } from 'react'
import { useTimeline } from '../hooks/use-timeline'
import { TimelineCard } from './TimelineCard'
import { DateSeparator } from './DateSeparator'

interface TimelineListProps {
  clientId: string
}

function toDateKey(dateStr: string) {
  return new Date(dateStr).toDateString()
}

export function TimelineList({ clientId }: TimelineListProps) {
  const { events, loading, hasMore, fetch, loadMore, deleteEvent } = useTimeline(clientId)

  useEffect(() => { fetch(true) }, [fetch])

  const grouped = useMemo(() => {
    const result: Array<{ dateKey: string; events: typeof events }> = []
    let current: (typeof result)[0] | null = null

    for (const e of events) {
      const key = toDateKey(e.createdAt)
      if (!current || current.dateKey !== key) {
        current = { dateKey: key, events: [] }
        result.push(current)
      }
      current.events.push(e)
    }
    return result
  }, [events])

  if (loading && events.length === 0) {
    return (
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!loading && events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-400">Nenhum evento na timeline</p>
        <p className="text-xs text-gray-300 mt-1">Os atendimentos aparecerão aqui automaticamente</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 pt-2">
      {/* Linha vertical */}
      <div className="relative">
        <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gray-100 -z-0" />

        <div className="space-y-4">
          {grouped.map(group => (
            <div key={group.dateKey}>
              <DateSeparator date={group.events[0].createdAt} />
              <div className="space-y-3 mt-3">
                {group.events.map(event => (
                  <TimelineCard
                    key={event.id}
                    event={event}
                    onDelete={deleteEvent}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-3 text-sm text-violet-600 font-medium disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </div>
  )
}
