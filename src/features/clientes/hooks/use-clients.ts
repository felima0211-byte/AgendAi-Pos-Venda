import { useState, useCallback, useRef } from 'react'

export interface ClientSummary {
  id: string
  name: string
  phone: string | null
  email: string | null
  city: string | null
  status: string
  tags: string[]
  updatedAt: string
  _count: { sales: number; reminders: number }
  sales: Array<{ createdAt: string; total: number; status: string }>
}

interface UseClientsOptions {
  limit?: number
}

export function useClients(options: UseClientsOptions = {}) {
  const { limit = 20 } = options
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const cursorRef = useRef<string | null>(null)
  const queryRef = useRef({ q: '', status: '' })

  const fetch = useCallback(async (q = '', status = '', reset = true) => {
    setLoading(true)
    setError(null)
    if (reset) {
      cursorRef.current = null
      queryRef.current = { q, status }
    }

    const params = new URLSearchParams({ limit: String(limit) })
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    if (!reset && cursorRef.current) params.set('cursor', cursorRef.current)

    try {
      const res = await window.fetch(`/api/clients?${params}`)
      if (!res.ok) throw new Error('Erro ao buscar clientes')
      const data = await res.json()

      setClients(prev => reset ? data.items : [...prev, ...data.items])
      setHasMore(data.hasMore)
      setTotal(data.total)
      cursorRef.current = data.nextCursor
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [limit])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetch(queryRef.current.q, queryRef.current.status, false)
    }
  }, [hasMore, loading, fetch])

  const refresh = useCallback(() => {
    fetch(queryRef.current.q, queryRef.current.status, true)
  }, [fetch])

  const deleteClient = useCallback(async (id: string) => {
    await window.fetch(`/api/clients/${id}`, { method: 'DELETE' })
    setClients(prev => prev.filter(c => c.id !== id))
    setTotal(prev => prev - 1)
  }, [])

  return { clients, loading, error, hasMore, total, fetch, loadMore, refresh, deleteClient }
}
