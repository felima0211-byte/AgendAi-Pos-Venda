import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const now = new Date()
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const reminders = await prisma.reminder.findMany({
    where: {
      deletedAt: null,
      status: 'PENDING',
      dueAt: { lte: endOfDay },
      client: { userId: dbUser.id, deletedAt: null },
    },
    orderBy: { dueAt: 'asc' },
    take: 20,
    include: { client: { select: { name: true } } },
  })

  const notifications = reminders.map((r) => ({
    id: r.id,
    title: r.title,
    clientName: r.client.name,
    dueAt: r.dueAt,
    overdue: r.dueAt < now,
  }))

  return NextResponse.json({ notifications, count: notifications.length })
}
