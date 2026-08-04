import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import { getDashboardData } from '@/features/dashboard/get-dashboard-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  const data = await getDashboardData(dbUser.id)
  return NextResponse.json(data)
}
