'use client'

import { useState, useEffect } from 'react'

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
  aiInsights: [],
  recentAtendimentos: [],
  itensVendidos: [],
  vendidoMes: 0,
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/dashboard')
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then((d) => { if (active) setData({ ...EMPTY, ...d }) })
      .catch(() => { if (active) setData(EMPTY) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return { data, loading }
}
