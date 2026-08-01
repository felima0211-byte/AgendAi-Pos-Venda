import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import { deriveDisplayStatus } from '@/services/post-sale/reminder-status'

/**
 * GET /api/dashboard
 * Métricas reais do usuário atual. Para um usuário novo, tudo retorna zerado
 * e as listas vêm vazias — prontas para receber os primeiros inputs.
 */
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const clientScope = { userId: dbUser.id, deletedAt: null as null }
  const reminderScope = { deletedAt: null as null, client: { userId: dbUser.id, deletedAt: null as null } }

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    totalClientes,
    inativos,
    totalVendas,
    concluidos,
    pendingReminders,
    vendasMes,
  ] = await Promise.all([
    prisma.client.count({ where: clientScope }),
    prisma.client.count({ where: { ...clientScope, status: 'INACTIVE' } }),
    prisma.sale.count({ where: { deletedAt: null, client: { userId: dbUser.id } } }),
    prisma.reminder.count({ where: { ...reminderScope, status: 'COMPLETED' } }),
    prisma.reminder.findMany({
      where: { ...reminderScope, status: { in: ['PENDING', 'SNOOZED'] } },
      orderBy: { dueAt: 'asc' },
      include: { client: { select: { name: true } } },
    }),
    prisma.sale.aggregate({
      _sum: { total: true },
      where: { deletedAt: null, client: { userId: dbUser.id }, createdAt: { gte: monthStart } },
    }),
  ])

  // Valor vendido no mês corrente (base da meta mensal). Decimal → number.
  const vendidoMes = Number(vendasMes._sum.total ?? 0)

  const now = new Date()
  const withDisplay = pendingReminders.map((r) => ({
    ...r,
    display: deriveDisplayStatus(r.status, r.dueAt, now),
  }))

  const overdue = withDisplay.filter((r) => r.display === 'overdue')
  const today = withDisplay.filter((r) => r.display === 'today')

  const todayReminders = today.map((r) => ({
    id: r.id,
    title: r.title,
    clientName: r.client.name,
    dueAt: 'Hoje',
    priority: r.priority,
  }))

  // Insights reais: eventos de IA gerados na timeline dos clientes do usuário
  const insightEvents = await prisma.timelineEvent.findMany({
    where: {
      type: 'AI_INSIGHT',
      aiInsight: { not: null },
      client: { userId: dbUser.id, deletedAt: null },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { client: { select: { name: true } } },
  })

  const aiInsights = insightEvents.map((e) => ({
    id: e.id,
    body: e.aiInsight ?? e.body ?? '',
    clientName: e.client.name,
  }))

  // Atendimentos recentes — últimos registros (áudio ou texto) do usuário
  const recentInteractions = await prisma.interaction.findMany({
    where: { deletedAt: null, client: { userId: dbUser.id, deletedAt: null } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { client: { select: { name: true } } },
  })

  const recentAtendimentos = recentInteractions.map((i) => ({
    id: i.id,
    clientName: i.client.name,
    summary: i.aiSummary ?? i.notes ?? 'Atendimento registrado',
    type: i.type,
    createdAt: i.createdAt,
  }))

  // Itens vendidos — agregação de produto → quantidade total (áudio/texto de venda)
  const saleItems = await prisma.saleItem.findMany({
    where: { sale: { deletedAt: null, client: { userId: dbUser.id, deletedAt: null } } },
    select: { quantity: true, product: { select: { name: true } } },
  })

  const itensMap = new Map<string, number>()
  for (const it of saleItems) {
    const nome = it.product.name
    itensMap.set(nome, (itensMap.get(nome) ?? 0) + it.quantity)
  }
  const itensVendidos = [...itensMap.entries()]
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)

  return NextResponse.json({
    stats: {
      clientes: { total: totalClientes, inativos },
      vendas: { total: totalVendas, label: 'registradas' },
      lembretes: { total: today.length + overdue.length, concluidos },
      posVendas: {
        total: pendingReminders.length,
        status: overdue.length === 0 ? 'Em dia' : `${overdue.length} atrasado${overdue.length > 1 ? 's' : ''}`,
      },
    },
    todayReminders,
    aiInsights,
    recentAtendimentos,
    itensVendidos,
    vendidoMes,
  })
}
