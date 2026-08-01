import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

type Period = 'daily' | 'weekly' | 'monthly'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

/**
 * GET /api/analytics/sales?period=daily|weekly|monthly
 * Linha de FATURAMENTO ACUMULADO (R$): eixo Y = R$, eixo X = período.
 * A cada balde o valor é a soma de todas as vendas até ali — a linha só sobe.
 */
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  const period = (new URL(req.url).searchParams.get('period') ?? 'daily') as Period

  const now = new Date()

  // limites (fim) de cada balde no eixo X
  const bucketEnds: { end: Date; label: string }[] = []
  if (period === 'daily') {
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(day.getDate() - i)
      bucketEnds.push({ end: endOfDay(day), label: WEEKDAYS[day.getDay()] })
    }
  } else if (period === 'weekly') {
    for (let i = 7; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(day.getDate() - i * 7)
      bucketEnds.push({ end: endOfDay(day), label: `${day.getDate()}/${day.getMonth() + 1}` })
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
      bucketEnds.push({ end, label: MONTHS[end.getMonth()] })
    }
  }

  const sales = await prisma.sale.findMany({
    where: { deletedAt: null, client: { userId: dbUser.id, deletedAt: null } },
    select: { createdAt: true, total: true },
  })

  // valor acumulado (R$) até o fim de cada balde
  const points = bucketEnds.map((b) => ({
    label: b.label,
    value: sales
      .filter((s) => s.createdAt <= b.end)
      .reduce((acc, s) => acc + Number(s.total), 0),
  }))

  const totalGeral = sales.reduce((acc, s) => acc + Number(s.total), 0)
  const first = points[0]?.value ?? 0
  const last = points[points.length - 1]?.value ?? 0

  return NextResponse.json({ period, points, total: last - first, totalGeral })
}
