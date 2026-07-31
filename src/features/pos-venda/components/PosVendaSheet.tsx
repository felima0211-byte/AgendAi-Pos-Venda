'use client'

import { useMemo, useState } from 'react'
import {
  X, CalendarClock, MessageCircle, Check, Ban, Sparkles, ChevronRight, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReminders, type Reminder } from '@/features/lembretes/hooks/use-reminders'
import { useClients } from '@/features/clientes/hooks/use-clients'
import { KindBadge } from '@/features/lembretes/components/KindBadge'
import { MessageGeneratorSheet } from '@/features/mensagens/components/MessageGeneratorSheet'

interface PosVendaSheetProps {
  open: boolean
  onClose: () => void
}

type Tab = 'agenda' | 'mensagem'

/** Opções de periodicidade (em dias) que a vendedora pode aplicar ao lembrete. */
const DAY_OPTIONS = [3, 7, 15, 30, 60, 90]

function formatDue(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso))
}

export function PosVendaSheet({ open, onClose }: PosVendaSheetProps) {
  const [tab, setTab] = useState<Tab>('agenda')
  const { buckets, loading, complete, cancel, rescheduleInDays, refresh } = useReminders()

  // cliente + lembrete alvo da geração de mensagem
  const [msgTarget, setMsgTarget] = useState<{ clientId: string; phone: string | null; reminderId?: string } | null>(null)

  const pending: Reminder[] = useMemo(
    () => [...buckets.overdue, ...buckets.today, ...buckets.upcoming],
    [buckets],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[400] flex items-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] leading-tight">Pós-venda</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Acompanhe e fale com suas clientes</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Abas */}
        <div className="flex gap-1 px-5 pb-3 shrink-0">
          {(['agenda', 'mensagem'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-semibold transition-colors',
                tab === t ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-500',
              )}
            >
              {t === 'agenda' ? 'Cronograma' : 'Mensagem'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-10">
          {tab === 'agenda' ? (
            <AgendaTab
              pending={pending}
              loading={loading}
              onReschedule={rescheduleInDays}
              onComplete={complete}
              onCancel={cancel}
              onMessage={(r) => setMsgTarget({ clientId: r.clientId, phone: r.client.phone, reminderId: r.id })}
            />
          ) : (
            <MensagemTab onPick={(clientId, phone) => setMsgTarget({ clientId, phone })} />
          )}
        </div>
      </div>

      {msgTarget && (
        <MessageGeneratorSheet
          open
          clientId={msgTarget.clientId}
          clientPhone={msgTarget.phone}
          reminderId={msgTarget.reminderId}
          defaultType="POST_SALE"
          onClose={() => {
            setMsgTarget(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

/* ── Aba Cronograma: lista de pós-vendas pendentes com edição de periodicidade ── */
function AgendaTab({
  pending, loading, onReschedule, onComplete, onCancel, onMessage,
}: {
  pending: Reminder[]
  loading: boolean
  onReschedule: (id: string, days: number) => void
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  onMessage: (r: Reminder) => void
}) {
  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-400">Carregando pós-vendas…</div>
  }
  if (!pending.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-500 font-medium">Nenhum pós-venda pendente</p>
        <p className="text-xs text-gray-400 mt-1">Registre um atendimento e o cronograma aparece aqui.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pt-1">
      {pending.map((r) => (
        <PosVendaCard key={r.id} reminder={r} onReschedule={onReschedule} onComplete={onComplete} onCancel={onCancel} onMessage={onMessage} />
      ))}
    </div>
  )
}

function PosVendaCard({
  reminder: r, onReschedule, onComplete, onCancel, onMessage,
}: {
  reminder: Reminder
  onReschedule: (id: string, days: number) => void
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  onMessage: (r: Reminder) => void
}) {
  const [editing, setEditing] = useState(false)
  const overdue = r.displayStatus === 'overdue'

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <KindBadge kind={r.kind} />
            <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold', overdue ? 'text-red-500' : 'text-gray-400')}>
              <CalendarClock className="w-3 h-3" /> {formatDue(r.dueAt)}
            </span>
          </div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-1.5 truncate">{r.client.name}</p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-snug mt-0.5">{r.title}</p>
        </div>
      </div>

      {/* Editor de periodicidade */}
      {editing && (
        <div className="mt-3 rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Receber o lembrete daqui a:</p>
          <div className="flex flex-wrap gap-1.5">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => { onReschedule(r.id, d); setEditing(false) }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-600 active:scale-95"
              >
                {d} dias
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onMessage(r)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" /> Mensagem
        </button>
        <button
          onClick={() => setEditing((v) => !v)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold"
        >
          <CalendarClock className="w-3.5 h-3.5" /> Dias
        </button>
        <button onClick={() => onComplete(r.id)} aria-label="Concluir" className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={() => onCancel(r.id)} aria-label="Cancelar" className="p-2 rounded-xl bg-gray-50 text-gray-400">
          <Ban className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ── Aba Mensagem: escolher cliente para escrever/gerar mensagem ── */
function MensagemTab({ onPick }: { onPick: (clientId: string, phone: string | null) => void }) {
  const { clients, loading, fetch } = useClients({ limit: 30 })
  const [q, setQ] = useState('')
  const [touched, setTouched] = useState(false)

  const search = (value: string) => {
    setQ(value)
    setTouched(true)
    fetch(value)
  }

  return (
    <div className="pt-1">
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => search(e.target.value)}
          onFocus={() => { if (!touched) { setTouched(true); fetch('') } }}
          placeholder="Buscar cliente…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      {loading && <div className="py-10 text-center text-sm text-gray-400">Carregando…</div>}

      {!loading && touched && !clients.length && (
        <div className="py-10 text-center text-sm text-gray-400">Nenhuma cliente encontrada.</div>
      )}

      {!loading && !touched && (
        <p className="py-8 text-center text-xs text-gray-400">Toque na busca para escolher a cliente e gerar a mensagem.</p>
      )}

      <div className="flex flex-col gap-1.5">
        {clients.map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c.id, c.phone)}
            className="flex items-center justify-between gap-2 p-3 rounded-xl border border-[var(--color-border)] bg-white active:scale-[0.99]"
          >
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{c.name}</p>
              <p className="text-xs text-gray-400">{c.phone ?? 'Sem telefone'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
