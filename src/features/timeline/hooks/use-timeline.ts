import { useState, useCallback, useRef } from 'react'

export interface TimelineEvent {
  id: string
  type: string
  title: string
  body: string | null
  createdAt: string
  sale: { id: string; total: number; status: string } | null
  metadata: Record<string, unknown> | null
}

export function useTimeline(clientId: string) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const cursorRef = useRef<string | null>(null)

  const fetch = useCallback(async (reset = true) => {
    setLoading(true)
    if (reset) cursorRef.current = null

    const params = new URLSearchParams({ limit: '30' })
    if (!reset && cursorRef.current) params.set('cursor', cursorRef.current)

    try {
      const res = await window.fetch(`/api/timeline/${clientId}?${params}`)
      if (!res.ok) throw new Error('Erro ao buscar timeline')
      const data = await res.json()

      // Filtra eventos com soft delete no metadata
      const visible = (data.items as TimelineEvent[]).filter(
        e => !(e.metadata as { deletedAt?: string })?.deletedAt
      )

      setEvents(prev => reset ? visible : [...prev, ...visible])
      setHasMore(data.hasMore)
      cursorRef.current = data.nextCursor
    } finally {
      setLoading(false)
    }
  }, [clientId])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) fetch(false)
  }, [hasMore, loading, fetch])

  const deleteEvent = useCallback(async (id: string) => {
    await window.fetch(`/api/timeline/event/${id}`, { method: 'DELETE' })
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  return { events, loading, hasMore, fetch, loadMore, deleteEvent }
}
