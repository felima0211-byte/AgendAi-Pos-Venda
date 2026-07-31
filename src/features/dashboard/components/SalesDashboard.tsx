'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSalesDashboard, type SalesPeriod } from '../hooks/use-sales-dashboard'

const PERIODS: { key: SalesPeriod; label: string }[] = [
  { key: 'daily', label: 'Diário' },
  { key: 'weekly', label: 'Semanal' },
  { key: 'monthly', label: 'Mensal' },
]

// dimensões do gráfico (viewBox)
const W = 320
const H = 120
const PAD = 8

export function SalesDashboard() {
  const { period, setPeriod, data, loading } = useSalesDashboard('daily')
  const [open, setOpen] = useState(true)

  const pts = data.points
  const values = pts.map((p) => p.value)
  const maxV = Math.max(1, ...values)
  const minV = Math.min(0, ...values)

  // mapeia cada ponto para coordenadas no viewBox
  const coords = pts.map((p, i) => {
    const x = pts.length > 1 ? PAD + (i / (pts.length - 1)) * (W - PAD * 2) : W / 2
    const y = H - PAD - ((p.value - minV) / (maxV - minV || 1)) * (H - PAD * 2)
    return { x, y, ...p }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${H - PAD} L ${coords[0].x.toFixed(1)} ${H - PAD} Z`
    : ''

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
          {/* Resumo */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Vendas no período</p>
              <p className="text-[22px] font-bold text-[var(--color-text-primary)] leading-none mt-1">{data.total}</p>
            </div>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-primary)]">
              <TrendingUp size={14} />
              {data.totalGeral} no total
            </span>
          </div>

          {/* Gráfico de linhas */}
          {loading ? (
            <div className="h-[120px] flex items-center justify-center text-[13px] text-[var(--color-text-tertiary)]">Carregando…</div>
          ) : data.total === 0 ? (
            <div className="h-[120px] flex items-center justify-center text-[13px] text-[var(--color-text-secondary)]">
              Nenhuma venda no período.
            </div>
          ) : (
            <>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[120px]" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {areaPath && <path d={areaPath} fill="url(#salesFill)" />}
                <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {coords.map((c, i) => (
                  <circle key={i} cx={c.x} cy={c.y} r={i === 0 ? 2.5 : 3.5} fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2" />
                ))}
              </svg>
              {/* rótulos das pontas */}
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-[var(--color-text-subtle)]">{coords[0]?.label}</span>
                <span className="text-[10px] text-[var(--color-text-subtle)]">{coords[coords.length - 1]?.label}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
