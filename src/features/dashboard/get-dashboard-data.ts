import { prisma } from '@/lib/prisma'
import { deriveDisplayStatus } from '@/services/post-sale/reminder-status'
import type { DashboardData } from './hooks/use-dashboard'

/** Monta o payload do dashboard para um usuário (usado no SSR da página e na rota /api/dashboard). */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const clientScope = { userId, deletedAt: null as null }
  const reminderScope = { deletedAt: null as null, client: { userId, deletedAt: null as null } }

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [totalClientes, inativos, totalVendas, concluidos, pendingReminders, vendasMes] = await Promise.all([
    prisma.client.count({ where: clientScope }),
    prisma.client.count({ where: { ...clientScope, status: 'INACTIVE' } }),
    prisma.sale.count({ where: { deletedAt: null, client: { userId } } }),
    prisma.reminder.count({ where: { ...reminderScope, status: 'COMPLETED' } }),
    prisma.reminder.findMany({
      where: { ...reminderScope, status: { in: ['PENDING', 'SNOOZED'] } },
      orderBy: { dueAt: 'asc' },
      include: { client: { select: { name: true } } },
    }),
    prisma.sale.aggregate({
      _sum: { total: true },
      where: { deletedAt: null, client: { userId }, createdAt: { gte: monthStart } },
    }),
  ])

  const vendidoMes = Number(vendasMes._sum.total ?? 0)

  const now = new Date()
  const withDisplay = pendingReminders.map((r) => ({ ...r, display: deriveDisplayStatus(r.status, r.dueAt, now) }))
  const overdue = withDisplay.filter((r) => r.display === 'overdue')
  const today = withDisplay.filter((r) => r.display === 'today')

  const todayReminders = today.map((r) => ({
    id: r.id, title: r.title, clientName: r.client.name, dueAt: 'Hoje', priority: r.priority,
  }))

  const overdueReminders = overdue.map((r) => {
    const diffDays = Math.max(1, Math.floor((now.getTime() - new Date(r.dueAt).getTime()) / 86_400_000))
    return { id: r.id, title: r.title, clientName: r.client.name, dueAt: r.dueAt.toISOString(), priority: r.priority, daysOverdue: diffDays }
  })

  const insightEvents = await prisma.timelineEvent.findMany({
    where: { type: 'AI_INSIGHT', aiInsight: { not: null }, client: { userId, deletedAt: null } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { client: { select: { name: true } } },
  })
  const aiInsights = insightEvents.map((e) => ({ id: e.id, body: e.aiInsight ?? e.body ?? '', clientName: e.client.name }))

  const recentInteractions = await prisma.interaction.findMany({
    where: { deletedAt: null, client: { userId, deletedAt: null } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { client: { select: { name: true } } },
  })
  const recentAtendimentos = recentInteractions.map((i) => ({
    id: i.id,
    clientName: i.client.name,
    summary: i.aiSummary ?? i.notes ?? 'Atendimento registrado',
    type: i.type,
    createdAt: i.createdAt.toISOString(),
  }))

  const saleItems = await prisma.saleItem.findMany({
    where: { sale: { deletedAt: null, client: { userId, deletedAt: null } } },
    select: { quantity: true, product: { select: { name: true } } },
  })
  const itensMap = new Map<string, number>()
  for (const it of saleItems) itensMap.set(it.product.name, (itensMap.get(it.product.name) ?? 0) + it.quantity)
  const itensVendidos = [...itensMap.entries()]
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)

  return {
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
    overdueReminders,
    aiInsights,
    recentAtendimentos,
    itensVendidos,
    vendidoMes,
  }
}
