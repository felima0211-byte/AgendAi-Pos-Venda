import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import { computeAnalytics } from '@/services/analytics/analytics.service'

/** GET /api/analytics — indicadores reais + insights determinísticos. */
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const analytics = await computeAnalytics(prisma, dbUser.id)
  return NextResponse.json(analytics)
}
