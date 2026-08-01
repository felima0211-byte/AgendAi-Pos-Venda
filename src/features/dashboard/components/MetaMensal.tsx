'use client'

import { useState, useEffect, useCallback } from 'react'
import { Target, Pencil, Check, X, CalendarRange } from 'lucide-react'
import { cn } from '@/lib/utils'
import { onRefresh } from '@/lib/refresh-bus'

const STORAGE_KEY = 'agendai:meta-mensal'

interface MetaConfig {
  valor: number
  inicio: string // YYYY-MM-DD
  fim: string    // YYYY-MM-DD
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateBR(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function defaultMonthRange(): { inicio: string; fim: string } {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { inicio: iso(first), fim: iso(last) }
}

export function MetaMensal() {
  const [config, setConfig] = useState<MetaConfig | null>(null)
  const [vendido, setVendido] = useState(0)
  const [editing, setEditing] = useState(false)
  const [draftValor, setDraftValor] = useState('')
  const [draftInicio, setDraftInicio] = useState('')
  const [draftFim, setDraftFim] = useState('')

  // carrega config salva
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try { setConfig(JSON.parse(raw)) } catch { /* ignore */ }
    }
  }, [])

  // busca faturamento do período de vigência
  const loadFaturamento = useCallback(async (cfg: MetaConfig) => {
    try {
      const res = await fetch(`/api/analytics/faturamento?from=${cfg.inicio}&to=${cfg.fim}`)
      if (res.ok) {
        const json = await res.json()
        setVendido(Number(json.total ?? 0))
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (config && config.valor > 0) loadFaturamento(config)
    return onRefresh(() => { if (config && config.valor > 0) loadFaturamento(config) })
  }, [config, loadFaturamento])

  const startEdit = () => {
    const range = defaultMonthRange()
    setDraftValor(config?.valor ? String(config.valor) : '')
    setDraftInicio(config?.inicio ?? range.inicio)
    setDraftFim(config?.fim ?? range.fim)
    setEditing(true)
  }

  const save = () => {
    const valor = Number(draftValor.replace(/\./g, '').replace(',', '.')) || 0
    const range = defaultMonthRange()
    const next: MetaConfig = {
      valor,
      inicio: draftInicio || range.inicio,
      fim: draftFim || range.fim,
    }
    setConfig(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setEditing(false)
  }

  const meta = config?.valor ?? 0
  const restante = Math.max(0, meta - vendido)
  const pct = meta > 0 ? Math.min(100, Math.round((vendido / meta) * 100)) : 0
  const atingida = meta > 0 && vendido >= meta

  return (
    <div className="mx-4 mt-4 bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary-tint)] text-[var(--color-primary)] flex items-center justify-center">
            <Target size={16} />
          </span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Meta do período</h3>
        </div>
        {!editing && (
          <button onClick={startEdit} aria-label="Editar meta" className="text-[var(--color-text-tertiary)] active:scale-95">
            <Pencil size={16} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2">
            <span className="text-sm text-[var(--color-text-subtle)]">R$</span>
            <input
              autoFocus inputMode="decimal" value={draftValor}
              onChange={(e) => setDraftValor(e.target.value)}
              placeholder="Valor da meta"
              className="flex-1 min-w-0 bg-transparent text-sm text-[var(--color-text-primary)] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex-1 flex flex-col gap-1">
              <span className="text-[11px] text-[var(--color-text-tertiary)]">Início da vigência</span>
              <input type="date" value={draftInicio} onChange={(e) => setDraftInicio(e.target.value)}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none" />
            </label>
            <label className="flex-1 flex flex-col gap-1">
              <span className="text-[11px] text-[var(--color-text-tertiary)]">Fim da vigência</span>
              <input type="date" value={draftFim} onChange={(e) => setDraftFim(e.target.value)}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none" />
            </label>
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={save} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-sm font-semibold">
              <Check size={16} /> Salvar meta
            </button>
            <button onClick={() => setEditing(false)} className="px-4 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] text-[var(--color-text-body)]">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : meta === 0 ? (
        <button onClick={startEdit} className="mt-3 w-full py-2.5 rounded-[var(--radius-md)] bg-[var(--color-primary-tint)] text-[var(--color-primary)] text-sm font-semibold">
          Definir meta e vigência
        </button>
      ) : (
        <div className="mt-3">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wide">
                {atingida ? 'Meta atingida 🎉' : 'Falta vender'}
              </p>
              <p className={cn('text-[20px] font-bold leading-none mt-1', atingida ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]')}>
                {atingida ? formatBRL(vendido) : formatBRL(restante)}
              </p>
            </div>
            <p className="text-[12px] text-[var(--color-text-subtle)]">{formatBRL(vendido)} / {formatBRL(meta)}</p>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--color-surface-alt)] overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-[var(--duration-slow)]', atingida ? 'bg-[var(--color-success)]' : 'bg-[var(--color-primary)]')}
              style={{ width: `${Math.max(pct, vendido > 0 ? 4 : 0)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-[var(--color-text-tertiary)]">{pct}% da meta</span>
            <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-subtle)]">
              <CalendarRange size={12} />
              {formatDateBR(config!.inicio)} – {formatDateBR(config!.fim)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
