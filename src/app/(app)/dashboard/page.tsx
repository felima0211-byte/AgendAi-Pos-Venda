import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { DashboardContent } from '@/features/dashboard/components/DashboardContent'
import { BottomNav } from '@/components/layout/BottomNav'

export default function DashboardPage() {
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
