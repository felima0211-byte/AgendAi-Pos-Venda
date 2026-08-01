'use client'

import { useState, useEffect, useCallback } from 'react'
import { onRefresh } from '@/lib/refresh-bus'

export interface VendasResumo {
  totalVendas: number
  totalItens: number
  totalFaturamento: number
  itens: Array<{ nome: string; quantidade: number }>
  porCliente: Array<{
    clientId: string
    name: string
    vendas: number
    itens: Array<{ nome: string; quantidade: number }>
  }>
}

const EMPTY: VendasResumo = { totalVendas: 0, totalItens: 0, totalFaturamento: 0, itens: [], porCliente: [] }

export function useVendas(enabled: boolean) {
  const [data, setData] = useState<VendasResumo>(EMPTY)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/vendas')
      setData(res.ok ? await res.json() : EMPTY)
    } catch {
      setData(EMPTY)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) load()
    return onRefresh(() => { if (enabled) load() })
  }, [enabled, load])

  return { data, loading, refresh: load }
}
