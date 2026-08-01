import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

/**
 * GET /api/analytics/faturamento?from=ISO&to=ISO
 * Soma de Sale.total no intervalo (base da meta com vigência).
 * Sem from/to → mês corrente.
 */
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  const { searchParams } = new URL(req.url)

  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  const from = fromParam ? new Date(fromParam) : (() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d })()
  const to = toParam ? new Date(toParam) : new Date()
  // inclui o dia final inteiro
  if (toParam) to.setHours(23, 59, 59, 999)

  const agg = await prisma.sale.aggregate({
    _sum: { total: true },
    _count: true,
    where: {
      deletedAt: null,
      client: { userId: dbUser.id, deletedAt: null },
      createdAt: { gte: from, lte: to },
    },
  })

  return NextResponse.json({
    total: Number(agg._sum.total ?? 0),
    vendas: agg._count,
    from: from.toISOString(),
    to: to.toISOString(),
  })
}
