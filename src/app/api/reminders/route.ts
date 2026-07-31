import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import { deriveDisplayStatus } from '@/services/post-sale/reminder-status'

/**
 * GET /api/reminders
 * Lista lembretes da vendedora agrupados em baldes para o dashboard:
 * overdue (atrasados), today (hoje), upcoming (próximos), done (concluídos).
 * Filtros opcionais: ?clientId= e ?bucket=
 */
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId') ?? undefined

  const reminders = await prisma.reminder.findMany({
    where: {
      deletedAt: null,
      client: { userId: dbUser.id, deletedAt: null },
      ...(clientId && { clientId }),
    },
    orderBy: { dueAt: 'asc' },
    include: {
      client: { select: { id: true, name: true, phone: true, status: true } },
    },
  })

  const now = new Date()
  const enriched = reminders.map((r) => ({
    ...r,
    displayStatus: deriveDisplayStatus(r.status, r.dueAt, now),
  }))

  const buckets = {
    overdue: enriched.filter((r) => r.displayStatus === 'overdue'),
    today: enriched.filter((r) => r.displayStatus === 'today'),
    upcoming: enriched.filter((r) => r.displayStatus === 'upcoming'),
    done: enriched
      .filter((r) => r.displayStatus === 'done')
      .sort((a, b) => +new Date(b.completedAt ?? b.updatedAt) - +new Date(a.completedAt ?? a.updatedAt)),
  }

  const counts = {
    overdue: buckets.overdue.length,
    today: buckets.today.length,
    upcoming: buckets.upcoming.length,
    done: buckets.done.length,
    pending: buckets.overdue.length + buckets.today.length + buckets.upcoming.length,
  }

  return NextResponse.json({ buckets, counts })
}

/**
 * POST /api/reminders — criação manual pela vendedora.
 */
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await req.json()
  const { clientId, title, body: reminderBody, dueAt, priority } = body

  if (!clientId || !title?.trim() || !dueAt) {
    return NextResponse.json({ error: 'clientId, title e dueAt são obrigatórios' }, { status: 400 })
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: dbUser.id, deletedAt: null },
  })
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const reminder = await prisma.reminder.create({
    data: {
      clientId,
      kind: 'CUSTOM',
      title: title.trim(),
      body: reminderBody?.trim() ?? null,
      dueAt: new Date(dueAt),
      priority: priority ?? 'MEDIUM',
    },
  })

  await prisma.timelineEvent.create({
    data: {
      clientId,
      type: 'REMINDER_CREATED',
      title: 'Lembrete criado',
      body: reminder.title,
    },
  })

  return NextResponse.json(reminder, { status: 201 })
}
