import { auth } from '@/lib/auth/server'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import { getDashboardData } from '@/features/dashboard/get-dashboard-data'
import { DashboardScreen } from '@/features/dashboard/components/DashboardScreen'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId } = await auth()
  const dbUser = userId ? await resolveDbUser(userId) : null
  const initial = dbUser ? await getDashboardData(dbUser.id) : null

  return <DashboardScreen initial={initial} />
}
