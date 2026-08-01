'use client'

import { useState, useEffect, useCallback } from 'react'
import { onRefresh } from '@/lib/refresh-bus'

export type SalesPeriod = 'daily' | 'weekly' | 'monthly'

export interface SalesSeries {
  period: SalesPeriod
  points: Array<{ value: number; t: string }>
  baseline: number
  totalGeral: number
  vendasNaJanela: number
}

const EMPTY: SalesSeries = { period: 'weekly', points: [], baseline: 0, totalGeral: 0, vendasNaJanela: 0 }

export function useSalesDashboard(initial: SalesPeriod = 'daily') {
  const [period, setPeriod] = useState<SalesPeriod>(initial)
  const [data, setData] = useState<SalesSeries>(EMPTY)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p: SalesPeriod) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/sales?period=${p}`)
      const json = res.ok ? await res.json() : EMPTY
      setData(json)
    } catch {
      setData({ ...EMPTY, period: p })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(period)
    return onRefresh(() => load(period))
  }, [period, load])

  return { period, setPeriod, data, loading }
}
