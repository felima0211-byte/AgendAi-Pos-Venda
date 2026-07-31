'use client'

import { useState, useEffect, useCallback } from 'react'

export type SalesPeriod = 'daily' | 'weekly' | 'monthly'

export interface SalesSeries {
  period: SalesPeriod
  points: Array<{ label: string; value: number }>
  total: number
  trend: number
  totalGeral: number
}

const EMPTY: SalesSeries = { period: 'daily', points: [], total: 0, trend: 0, totalGeral: 0 }

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

  useEffect(() => { load(period) }, [period, load])

  return { period, setPeriod, data, loading }
}
