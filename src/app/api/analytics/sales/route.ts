import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

type Period = 'daily' | 'weekly' | 'monthly'

/**
 * GET /api/analytics/sales?period=daily|weekly|monthly
 * Série de LINHA cumulativa: cada venda é um ponto e a linha vai crescendo.
 * O eixo Y é o total de vendas acumulado; o X é o momento de cada venda dentro da janela.
 */
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  const period = (new URL(req.url).searchParams.get('period') ?? 'daily') as Period

  const now = new Date()
  const windowStart = new Date(now)
  if (period === 'daily') windowStart.setHours(0, 0, 0, 0)
  else if (period === 'weekly') { windowStart.setDate(windowStart.getDate() - 6); windowStart.setHours(0, 0, 0, 0) }
  else { windowStart.setMonth(windowStart.getMonth() - 1); windowStart.setHours(0, 0, 0, 0) }

  const scope = { deletedAt: null, client: { userId: dbUser.id, deletedAt: null } }

  // Total de vendas antes da janela (ponto de partida da linha)
  const countBefore = await prisma.sale.count({ where: { ...scope, createdAt: { lt: windowStart } } })

  // Vendas dentro da janela, em ordem cronológica
  const sales = await prisma.sale.findMany({
    where: { ...scope, createdAt: { gte: windowStart } },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  })

  const fmt = new Intl.DateTimeFormat('pt-BR',
    period === 'daily'
      ? { hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: '2-digit' },
  )

  // Ponto inicial (base) + um ponto cumulativo por venda
  const points: { label: string; value: number }[] = [
    { label: 'Início', value: countBefore },
    ...sales.map((s, i) => ({ label: fmt.format(s.createdAt), value: countBefore + i + 1 })),
  ]

  const total = sales.length
  const trend = total // vendas no período (a linha cresceu esse tanto)

  return NextResponse.json({ period, points, total, trend, totalGeral: countBefore + total })
}
