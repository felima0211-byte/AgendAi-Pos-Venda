import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

type Period = 'daily' | 'weekly' | 'monthly'

const WINDOW_DAYS: Record<Period, number> = { daily: 1, weekly: 7, monthly: 30 }

/**
 * GET /api/analytics/sales?period=daily|weekly|monthly
 * Linha estilo "finance": UM ponto por venda, faturamento ACUMULADO (R$) no eixo Y.
 * A linha avança a cada venda dentro da janela. `baseline` = acumulado antes da janela.
 */
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  const period = (new URL(req.url).searchParams.get('period') ?? 'weekly') as Period

  const windowStart = new Date()
  windowStart.setDate(windowStart.getDate() - WINDOW_DAYS[period])

  const scope = { deletedAt: null, client: { userId: dbUser.id, deletedAt: null } }

  const [before, sales] = await Promise.all([
    prisma.sale.findMany({ where: { ...scope, createdAt: { lt: windowStart } }, select: { total: true } }),
    prisma.sale.findMany({
      where: { ...scope, createdAt: { gte: windowStart } },
      orderBy: { createdAt: 'asc' },
      select: { total: true, createdAt: true },
    }),
  ])

  const baseline = before.reduce((a, s) => a + Number(s.total), 0)

  // ponto inicial (base) + um ponto acumulado por venda
  let acc = baseline
  const points = [{ value: baseline, t: windowStart.toISOString() }]
  for (const s of sales) {
    acc += Number(s.total)
    points.push({ value: acc, t: s.createdAt.toISOString() })
  }

  return NextResponse.json({
    period,
    points,
    baseline,
    totalGeral: acc,
    vendasNaJanela: sales.length,
  })
}
