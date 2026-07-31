'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'
import type { DashboardData } from '../hooks/use-dashboard'

const LIMIT = 4

export function ItensVendidos({ items }: { items: DashboardData['itensVendidos'] }) {
  const [expanded, setExpanded] = useState(false)
  const totalUnidades = items.reduce((acc, i) => acc + i.quantidade, 0)
  const visible = expanded ? items : items.slice(0, LIMIT)
  const canToggle = items.length > LIMIT

  return (
    <div className="px-4 mt-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Itens vendidos</h2>
          {totalUnidades > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary)] text-[11px] font-bold flex items-center justify-center">
              {totalUnidades}
            </span>
          )}
        </span>
        {canToggle && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[13px] font-semibold text-[var(--color-primary)]"
          >
            {expanded ? 'Ver menos' : 'Ver mais'}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Nenhum item vendido ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((item) => (
            <div
              key={item.nome}
              className="flex items-center gap-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-3 border border-[var(--color-border)]"
            >
              <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary-tint)] flex items-center justify-center shrink-0">
                <Package size={16} className="text-[var(--color-primary)]" />
              </div>
              <p className="flex-1 min-w-0 text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {item.nome}
              </p>
              <span className="shrink-0 min-w-[28px] h-7 px-2 rounded-lg bg-[var(--color-surface-alt)] text-[var(--color-text-body)] text-sm font-bold flex items-center justify-center">
                {item.quantidade}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
