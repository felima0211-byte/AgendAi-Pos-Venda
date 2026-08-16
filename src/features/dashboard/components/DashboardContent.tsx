'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StatsGrid } from './StatsGrid'
import { RecordAttendance } from './RecordAttendance'
import { TodayReminders } from './TodayReminders'
import { RecentAtendimentos } from './RecentAtendimentos'
import { ItensVendidos } from './ItensVendidos'
import { SalesDashboard } from './SalesDashboard'
import { MetaMensal } from './MetaMensal'
import { useDashboard } from '../hooks/use-dashboard'
import { PosVendaSheet } from '@/features/pos-venda/components/PosVendaSheet'
import { VendasSheet } from './VendasSheet'
import { DicaDoDia } from './DicaDoDia'
import { AlertasOportunidade } from './AlertasOportunidade'

export function DashboardContent() {
  const { data } = useDashboard()
  const router = useRouter()
  const [posVendaOpen, setPosVendaOpen] = useState(false)
  const [vendasOpen, setVendasOpen] = useState(false)

  return (
    <>
      <DicaDoDia />
      <AlertasOportunidade />
      <StatsGrid
        stats={data.stats}
        onClientesClick={() => router.push('/clientes')}
        onVendasClick={() => setVendasOpen(true)}
        onLembretesClick={() => router.push('/lembretes')}
        onPosVendaClick={() => setPosVendaOpen(true)}
      />
      <MetaMensal vendidoMes={data.vendidoMes} />
      <RecordAttendance />
      <TodayReminders reminders={data.todayReminders} overdueReminders={data.overdueReminders} />
      <RecentAtendimentos items={data.recentAtendimentos} />
      <ItensVendidos items={data.itensVendidos} />
      <SalesDashboard />
      <PosVendaSheet open={posVendaOpen} onClose={() => setPosVendaOpen(false)} />
      <VendasSheet open={vendasOpen} onClose={() => setVendasOpen(false)} />
    </>
  )
}
