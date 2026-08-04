'use client'

import { DashboardHeader } from './DashboardHeader'
import { DashboardContent } from './DashboardContent'
import { BottomNav } from '@/components/layout/BottomNav'
import { seedDashboard, type DashboardData } from '../hooks/use-dashboard'

export function DashboardScreen({ initial }: { initial: DashboardData | null }) {
  // Semeia o cache ANTES dos filhos renderizarem → Header/Content já pintam com dados (sem zerar)
  if (initial) seedDashboard(initial)

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-background)]">
      <main className="flex-1 overflow-y-auto pb-24">
        <DashboardHeader />
        <DashboardContent />
      </main>
      <BottomNav />
    </div>
  )
}
