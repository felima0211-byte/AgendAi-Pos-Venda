'use client'

import { useRouter } from 'next/navigation'
import { X, ShoppingBag, Package, ChevronRight } from 'lucide-react'
import { useVendas } from '../hooks/use-vendas'
import { SalesDashboard } from './SalesDashboard'

interface VendasSheetProps {
  open: boolean
  onClose: () => void
}

export function VendasSheet({ open, onClose }: VendasSheetProps) {
  const router = useRouter()
  const { data, loading } = useVendas(open)

  if (!open) return null

  const goClient = (id: string) => {
    onClose()
    router.push(`/clientes/${id}`)
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative w-full bg-[var(--color-surface)] rounded-t-3xl max-h-[92vh] flex flex-col animate-slide-up">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-[#E4F6EC] text-[var(--color-success)] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] leading-tight">Vendas</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Evolução e itens vendidos por cliente</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar"><X className="w-5 h-5 text-[var(--color-text-tertiary)]" /></button>
        </div>

        <div className="flex-1 overflow-y-auto pb-10">
          {/* Totais */}
          <div className="px-5">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 mb-2">
              <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Faturamento</p>
              <p className="text-[22px] font-bold text-[var(--color-success)] leading-none mt-1">
                {data.totalFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Total de vendas</p>
                <p className="text-[22px] font-bold text-[var(--color-text-primary)] leading-none mt-1">{data.totalVendas}</p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Itens vendidos</p>
                <p className="text-[22px] font-bold text-[var(--color-text-primary)] leading-none mt-1">{data.totalItens}</p>
              </div>
            </div>
          </div>

          {/* Gráfico de evolução (reuso) */}
          <SalesDashboard />

          {/* Por cliente — confirmação cruzada com a aba de clientes */}
          <div className="px-5 mt-4">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Vendas por cliente</h4>

            {loading ? (
              <p className="text-[13px] text-[var(--color-text-tertiary)] py-6 text-center">Carregando…</p>
            ) : data.porCliente.length === 0 ? (
              <p className="text-[13px] text-[var(--color-text-secondary)]">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.porCliente.map((c) => (
                  <button
                    key={c.clientId}
                    onClick={() => goClient(c.clientId)}
                    className="text-left rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{c.name}</p>
                      <span className="flex items-center gap-1 shrink-0 text-[12px] text-[var(--color-text-subtle)]">
                        {c.vendas} venda{c.vendas > 1 ? 's' : ''}
                        <ChevronRight className="w-4 h-4 text-[var(--color-divider)]" />
                      </span>
                    </div>
                    {c.itens.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.itens.map((it) => (
                          <span
                            key={it.nome}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary)]"
                          >
                            <Package className="w-2.5 h-2.5" />
                            {it.nome} ×{it.quantidade}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
