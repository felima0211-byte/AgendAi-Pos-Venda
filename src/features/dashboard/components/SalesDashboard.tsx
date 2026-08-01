'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSalesDashboard, type SalesPeriod } from '../hooks/use-sales-dashboard'

const PERIODS: { key: SalesPeriod; label: string }[] = [
  { key: 'daily', label: 'Hoje' },
  { key: 'weekly', label: 'Semana' },
  { key: 'monthly', label: 'Mês' },
]

const W = 320
const H = 130
const PAD_X = 6
const PAD_Y = 12

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function SalesDashboard() {
  const { period, setPeriod, data, loading } = useSalesDashboard('weekly')
  const [open, setOpen] = useState(true)

  const values = data.points.map((p) => p.value)
  const minV = values.length ? Math.min(...values) : 0
  const maxV = values.length ? Math.max(...values) : 1
  const span = Math.max(1, maxV - minV)

  const coords = data.points.map((p, i) => {
    const x = data.points.length > 1 ? PAD_X + (i / (data.points.length - 1)) * (W - PAD_X * 2) : W - PAD_X
    const y = H - PAD_Y - ((p.value - minV) / span) * (H - PAD_Y * 2)
    return { x, y, value: p.value }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${H - PAD_Y} L ${coords[0].x.toFixed(1)} ${H - PAD_Y} Z`
    : ''
  const last = coords[coords.length - 1]
  // linha de referência pontilhada = base (acumulado antes da janela)
  const baseY = H - PAD_Y - ((data.baseline - minV) / span) * (H - PAD_Y * 2)
  const cresceu = data.totalGeral >= data.baseline
  const lineColor = cresceu ? 'var(--color-success)' : 'var(--color-error)'

  return (
    <div className="px-4 mt-6 mb-4 animate-slide-up" style={{ animationDelay: '240ms' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Dashboard de vendas</h2>
          <button onClick={() => setOpen((v) => !v)} className="text-[13px] font-semibold text-[var(--color-primary)]">
            {open ? 'Ver menos' : 'Ver mais'}
          </button>
        </span>
        {open && (
          <div className="flex gap-1 bg-[var(--color-surface-alt)] rounded-[var(--radius-full)] p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  'px-2.5 py-1 rounded-[var(--radius-full)] text-[11px] font-semibold transition-colors',
                  period === p.key ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Faturamento acumulado</p>
              <p className="text-[22px] font-bold text-[var(--color-text-primary)] leading-none mt-1">
                {data.totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            {data.vendasNaJanela > 0 && (
              <span className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: lineColor }}>
                <TrendingUp size={14} /> +{brl(data.totalGeral - data.baseline)}
              </span>
            )}
          </div>

          {loading ? (
            <div className="h-[130px] flex items-center justify-center text-[13px] text-[var(--color-text-tertiary)]">Carregando…</div>
          ) : data.points.length <= 1 ? (
            <div className="h-[130px] flex items-center justify-center text-[13px] text-[var(--color-text-secondary)]">
              Nenhuma venda no período.
            </div>
          ) : (
            <div className="relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[130px]" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* referência pontilhada (base) */}
                <line x1={PAD_X} y1={baseY} x2={W - PAD_X} y2={baseY} stroke="var(--color-divider)" strokeWidth="1" strokeDasharray="2 3" />
                {areaPath && <path d={areaPath} fill="url(#salesFill)" />}
                <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                {last && <circle cx={last.x} cy={last.y} r={3.5} fill={lineColor} />}
              </svg>
              {/* rótulos Y (topo/base) sobrepostos */}
              <span className="absolute top-1 left-0 text-[9px] text-[var(--color-text-tertiary)]">{brl(maxV)}</span>
              <span className="absolute bottom-1 left-0 text-[9px] text-[var(--color-text-tertiary)]">{brl(minV)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
