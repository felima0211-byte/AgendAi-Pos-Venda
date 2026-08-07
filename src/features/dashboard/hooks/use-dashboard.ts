'use client'

import { useState, useEffect, useCallback } from 'react'
import { onRefresh } from '@/lib/refresh-bus'

export interface DashboardData {
  stats: {
    clientes: { total: number; inativos: number }
    vendas: { total: number; label: string }
    lembretes: { total: number; concluidos: number }
    posVendas: { total: number; status: string }
  }
  todayReminders: Array<{
    id: string
    title: string
    clientName: string
    dueAt: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
  }>
  overdueReminders: Array<{
    id: string
    title: string
    clientName: string
    dueAt: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    daysOverdue: number
  }>
  aiInsights: Array<{ id: string; body: string; clientName: string }>
  recentAtendimentos: Array<{
    id: string
    clientName: string
    summary: string
    type: string
    createdAt: string
  }>
  itensVendidos: Array<{ nome: string; quantidade: number }>
  vendidoMes: number
}

// Estado zerado — o que um usuário novo vê antes do primeiro atendimento
const EMPTY: DashboardData = {
  stats: {
    clientes: { total: 0, inativos: 0 },
    vendas: { total: 0, label: 'registradas' },
    lembretes: { total: 0, concluidos: 0 },
    posVendas: { total: 0, status: 'Em dia' },
  },
  todayReminders: [],
  overdueReminders: [],
  aiInsights: [],
  recentAtendimentos: [],
  itensVendidos: [],
  vendidoMes: 0,
}

// Cache em módulo: Header e Content compartilham o último dado (evita "zerar e voltar")
let cache: DashboardData = EMPTY

/** Semeia o cache com o dado renderizado no servidor (SSR) — primeiro paint já vem preenchido. */
export function seedDashboard(d: DashboardData) {
  cache = d
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(cache)
  const [loading, setLoading] = useState(cache === EMPTY)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/dashboard')
      if (r.ok) {
        const d = await r.json()
        cache = { ...EMPTY, ...d }
        setData(cache)
      }
    } catch {
      /* mantém o cache */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    return onRefresh(load)
  }, [load])

  return { data, loading, refresh: load }
}
