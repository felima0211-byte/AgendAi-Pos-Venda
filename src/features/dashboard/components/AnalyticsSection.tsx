'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Clock, Sparkles, Package } from 'lucide-react'

interface Analytics {
  indicators: {
    taxaRecompra: number
    tempoMedioSemContato: number | null
    clientesSemContato45d: number
    recompras: number
    clientesRecorrentes: number
  }
  topProdutos: Array<{ nome: string; total: number }>
  insights: string[]
}

export function AnalyticsSection() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/analytics')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active) setData(d) })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) {
    return (
      <div className="px-4 mt-6">
        <div className="h-24 bg-white rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!data) return null

  const { indicators, topProdutos, insights } = data

  return (
    <div className="px-4 mt-6">
      <h2 className="font-bold text-[var(--color-text-primary)] mb-3">Indicadores</h2>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{indicators.taxaRecompra}%</p>
          <p className="text-xs text-gray-400 mt-1">Taxa de recompra</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 leading-none">
            {indicators.tempoMedioSemContato != null ? `${indicators.tempoMedioSemContato}d` : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Tempo médio sem contato</p>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mt-3 space-y-2">
          {insights.map((text, i) => (
            <div key={i} className="flex items-start gap-2 bg-gradient-to-br from-violet-50 to-violet-50/40 border border-violet-100 rounded-xl p-3">
              <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-snug">{text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top produtos */}
      {topProdutos.length > 0 && (
        <div className="mt-3 bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">Mais vendidos</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topProdutos.map((p) => (
              <span key={p.nome} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full capitalize">
                {p.nome} · {p.total}
              </span>
            ))}
          </div>
        </div>
      )}

      {insights.length === 0 && topProdutos.length === 0 && (
        <p className="text-sm text-gray-400 mt-3">
          Seus indicadores aparecem aqui conforme você registra atendimentos e vendas.
        </p>
      )}
    </div>
  )
}
