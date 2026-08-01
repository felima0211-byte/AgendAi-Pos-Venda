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

const W = 320
const H = 120
const PAD_X = 10
const PAD_TOP = 12
const PAD_BOTTOM = 10

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function SalesDashboard() {
  const { period, setPeriod, data, loading } = useSalesDashboard('daily')
  const [open, setOpen] = useState(true)

  const pts = data.points
  const values = pts.map((p) => p.value)
  const maxV = Math.max(1, ...values)

  const coords = pts.map((p, i) => {
    const x = pts.length > 1 ? PAD_X + (i / (pts.length - 1)) * (W - PAD_X * 2) : W / 2
    const y = H - PAD_BOTTOM - (p.value / maxV) * (H - PAD_TOP - PAD_BOTTOM)
    return { x, y, ...p }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${H - PAD_BOTTOM} L ${coords[0].x.toFixed(1)} ${H - PAD_BOTTOM} Z`
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
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Faturamento acumulado</p>
              <p className="text-[22px] font-bold text-[var(--color-text-primary)] leading-none mt-1">
                {data.totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            {data.total > 0 && (
              <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-success)]">
                <TrendingUp size={14} /> +{brl(data.total)}
              </span>
            )}
          </div>

          {loading ? (
            <div className="h-[120px] flex items-center justify-center text-[13px] text-[var(--color-text-tertiary)]">Carregando…</div>
          ) : data.totalGeral === 0 ? (
            <div className="h-[120px] flex items-center justify-center text-[13px] text-[var(--color-text-secondary)]">
              Sem vendas no período.
            </div>
          ) : (
            <div className="flex">
              {/* eixo Y (R$) */}
              <div className="flex flex-col justify-between h-[120px] pr-2 text-right shrink-0">
                <span className="text-[9px] text-[var(--color-text-tertiary)]">{brl(maxV)}</span>
                <span className="text-[9px] text-[var(--color-text-tertiary)]">{brl(maxV / 2)}</span>
                <span className="text-[9px] text-[var(--color-text-tertiary)]">R$ 0</span>
              </div>
              <div className="flex-1 min-w-0">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[120px]" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.20" />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* linhas de grade */}
                  {[PAD_TOP, (H - PAD_BOTTOM + PAD_TOP) / 2, H - PAD_BOTTOM].map((gy, i) => (
                    <line key={i} x1={PAD_X} y1={gy} x2={W - PAD_X} y2={gy} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
                  ))}
                  {areaPath && <path d={areaPath} fill="url(#salesFill)" />}
                  <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  {coords.map((c, i) => (
                    <circle key={i} cx={c.x} cy={c.y} r={3} fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2" />
                  ))}
                </svg>
                {/* eixo X (período) */}
                <div className="flex justify-between mt-1">
                  {coords.map((c, i) => (
                    <span key={i} className="text-[9px] text-[var(--color-text-subtle)] flex-1 text-center truncate">{c.label}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
