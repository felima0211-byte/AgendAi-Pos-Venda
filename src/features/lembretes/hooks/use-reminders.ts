import { useState, useCallback, useEffect } from 'react'

export type ReminderKind =
  | 'POST_SALE_CHECK' | 'EXCHANGE_CHECK' | 'RECOMMEND'
  | 'SIZE_UPDATE' | 'REACTIVATE' | 'WINBACK' | 'CUSTOM'

export type DisplayStatus = 'today' | 'overdue' | 'upcoming' | 'done' | 'cancelled'

export interface Reminder {
  id: string
  clientId: string
  kind: ReminderKind
  title: string
  body: string | null
  dueAt: string
  status: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  aiGenerated: boolean
  aiReason: string | null
  metadata: Record<string, unknown> | null
  displayStatus: DisplayStatus
  client: { id: string; name: string; phone: string | null; status: string }
}

interface Buckets {
  overdue: Reminder[]
  today: Reminder[]
  upcoming: Reminder[]
  done: Reminder[]
}

interface Counts {
  overdue: number
  today: number
  upcoming: number
  done: number
  pending: number
}

const EMPTY: Buckets = { overdue: [], today: [], upcoming: [], done: [] }

export function useReminders(clientId?: string) {
  const [buckets, setBuckets] = useState<Buckets>(EMPTY)
  const [counts, setCounts] = useState<Counts>({ overdue: 0, today: 0, upcoming: 0, done: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (clientId) params.set('clientId', clientId)
      const res = await window.fetch(`/api/reminders?${params}`)
      if (!res.ok) throw new Error('Erro ao carregar lembretes')
      const data = await res.json()
      setBuckets(data.buckets)
      setCounts(data.counts)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  const act = useCallback(async (id: string, action: string, extra: Record<string, unknown> = {}) => {
    await window.fetch(`/api/reminders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    await fetch()
  }, [fetch])

  const complete = useCallback((id: string) => act(id, 'complete'), [act])
  const snooze = useCallback((id: string, days: number) => act(id, 'snooze', { days }), [act])
  const cancel = useCallback((id: string) => act(id, 'cancel'), [act])
  const reopen = useCallback((id: string) => act(id, 'reopen'), [act])
  const edit = useCallback(
    (id: string, data: { title?: string; body?: string; dueAt?: string; priority?: string }) =>
      act(id, 'edit', data),
    [act],
  )
  // Reagenda o lembrete para daqui a N dias a partir de hoje (periodicidade do pós-venda).
  const rescheduleInDays = useCallback(
    (id: string, days: number) => {
      const due = new Date()
      due.setHours(9, 0, 0, 0)
      due.setDate(due.getDate() + days)
      return edit(id, { dueAt: due.toISOString() })
    },
    [edit],
  )

  return { buckets, counts, loading, error, refresh: fetch, complete, snooze, cancel, reopen, edit, rescheduleInDays }
}
