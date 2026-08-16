'use client'

import { useState, useRef } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSalesDashboard, type SalesPeriod } from '../hooks/use-sales-dashboard'

const PERIODS: { key: SalesPeriod; label: string }[] = [
  { key: 'daily', label: 'Hoje' },
  { key: 'weekly', label: 'Semana' },
  { key: 'monthly', label: 'Mês' },
]

const W = 320
const H = 120
const PAD_X = 4
const PAD_Y = 10

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

// Gera path com curva suave estilo Google Finance usando bezier
function smoothPath(coords: { x: number; y: number }[]) {
  if (coords.length < 2) return ''
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1]
    const curr = coords[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx.toFixed(1)} ${prev.y.toFixed(1)}, ${cpx.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`
  }
  return d
}

export function SalesDashboard() {
  const { period, setPeriod, data, loading } = useSalesDashboard('weekly')
  const [open, setOpen] = useState(true)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; label: string } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const values = data.points.map((p) => p.value)
  const minV = values.length ? Math.min(...values) : 0
  const maxV = values.length ? Math.max(...values) : 1
  const span = Math.max(1, maxV - minV)

  const coords = data.points.map((p, i) => {
    const x = data.points.length > 1 ? PAD_X + (i / (data.points.length - 1)) * (W - PAD_X * 2) : W / 2
    const y = H - PAD_Y - ((p.value - minV) / span) * (H - PAD_Y * 2)
    return { x, y, value: p.value, label: p.label ?? '' }
  })

  const linePath = smoothPath(coords)
  const areaPath = coords.length >= 2
    ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${H} L ${coords[0].x.toFixed(1)} ${H} Z`
    : ''
  const last = coords[coords.length - 1]
  const cresceu = data.totalGeral >= data.baseline
  const lineColor = cresceu ? '#1B9D6A' : '#C4342F'
  const diff = data.totalGeral - data.baseline

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || coords.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * W
    let closest = coords[0]
    let minDist = Math.abs(coords[0].x - mouseX)
    for (const c of coords) {
      const d = Math.abs(c.x - mouseX)
      if (d < minDist) { minDist = d; closest = c }
    }
    setTooltip(closest)
  }

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
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 pt-4 pb-2">
          {/* Header com valor e variação */}
          <div className="flex items-end justify-between mb-1">
            <div>
              <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                Faturamento acumulado
              </p>
              <p className="text-[24px] font-bold text-[var(--color-text-primary)] leading-none">
                {brl(tooltip ? tooltip.value : data.totalGeral)}
              </p>
              {tooltip && (
                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{tooltip.label}</p>
              )}
            </div>
            {diff !== 0 && (
              <span
                className="flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-lg mb-0.5"
                style={{ color: lineColor, backgroundColor: cresceu ? '#E6F9F0' : '#FEF2F2' }}
              >
                {cresceu ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {diff > 0 ? '+' : ''}{brl(diff)}
              </span>
            )}
          </div>

          {/* Gráfico */}
          {loading ? (
            <div className="h-[120px] flex items-center justify-center text-[13px] text-[var(--color-text-tertiary)]">
              Carregando…
            </div>
          ) : coords.length <= 1 ? (
            <div className="h-[120px] flex items-center justify-center text-[13px] text-[var(--color-text-secondary)]">
              Nenhuma venda no período.
            </div>
          ) : (
            <div className="relative mt-3" onMouseLeave={() => setTooltip(null)}>
              <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-[120px]"
                preserveAspectRatio="none"
                onMouseMove={handleMouseMove}
              >
                <defs>
                  <linearGradient id="gfFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity="0.08" />
                    <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Área preenchida suave */}
                {areaPath && <path d={areaPath} fill="url(#gfFill)" />}

                {/* Linha principal — fina como Google Finance */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Linha vertical do tooltip */}
                {tooltip && (
                  <line
                    x1={tooltip.x}
                    y1={PAD_Y}
                    x2={tooltip.x}
                    y2={H}
                    stroke="var(--color-divider)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Ponto do tooltip */}
                {tooltip && (
                  <>
                    <circle cx={tooltip.x} cy={tooltip.y} r={4} fill="white" stroke={lineColor} strokeWidth="1.5" />
                  </>
                )}

                {/* Ponto final */}
                {!tooltip && last && (
                  <circle cx={last.x} cy={last.y} r={2.5} fill={lineColor} />
                )}
              </svg>

              {/* Rótulos eixo Y */}
              <span className="absolute top-0 right-0 text-[9px] text-[var(--color-text-tertiary)]">{brl(maxV)}</span>
              <span className="absolute bottom-2 right-0 text-[9px] text-[var(--color-text-tertiary)]">{brl(minV)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
