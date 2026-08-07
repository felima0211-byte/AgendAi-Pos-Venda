import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

const DAY_MS = 24 * 60 * 60 * 1000

async function authorize(clerkId: string, reminderId: string) {
  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return { error: 'Usuário não encontrado', status: 404, reminder: null }

  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, deletedAt: null, client: { userId: dbUser.id } },
    include: { client: { select: { id: true, name: true } } },
  })
  if (!reminder) return { error: 'Lembrete não encontrado', status: 404, reminder: null }

  return { error: null, status: 200, reminder }
}

/**
 * PATCH /api/reminders/[id]
 * action: complete | snooze (days) | cancel | reopen | edit
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const { error, status, reminder } = await authorize(clerkId, id)
  if (error || !reminder) return NextResponse.json({ error }, { status })

  const body = await req.json()
  const { action } = body

  switch (action) {
    case 'complete': {
      const updated = await prisma.reminder.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      })
      await prisma.timelineEvent.create({
        data: {
          clientId: reminder.clientId,
          type: 'REMINDER_COMPLETED',
          title: 'Pós-venda concluído',
          body: reminder.title,
        },
      })
      return NextResponse.json(updated)
    }

    case 'snooze': {
      const raw = Number(body.days)
      const days = Number.isFinite(raw) && raw >= 1 && raw <= 365 ? Math.floor(raw) : 1
      const base = new Date(reminder.dueAt) < new Date() ? new Date() : new Date(reminder.dueAt)
      const updated = await prisma.reminder.update({
        where: { id },
        data: { status: 'SNOOZED', dueAt: new Date(base.getTime() + days * DAY_MS) },
      })
      return NextResponse.json(updated)
    }

    case 'cancel': {
      const updated = await prisma.reminder.update({
        where: { id },
        data: { status: 'CANCELLED' },
      })
      return NextResponse.json(updated)
    }

    case 'reopen': {
      const updated = await prisma.reminder.update({
        where: { id },
        data: { status: 'PENDING', completedAt: null },
      })
      return NextResponse.json(updated)
    }

    case 'edit': {
      const { title, body: reminderBody, dueAt, priority } = body
      const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']
      const parsedDueAt = dueAt ? new Date(dueAt) : null
      const updated = await prisma.reminder.update({
        where: { id },
        data: {
          ...(title && typeof title === 'string' && { title: title.trim().slice(0, 255) }),
          ...(reminderBody !== undefined && { body: typeof reminderBody === 'string' ? reminderBody.trim().slice(0, 1000) : null }),
          ...(parsedDueAt && !isNaN(parsedDueAt.getTime()) && { dueAt: parsedDueAt }),
          ...(priority && VALID_PRIORITIES.includes(priority) && { priority }),
        },
      })
      return NextResponse.json(updated)
    }

    default:
      return NextResponse.json({ error: 'action inválida' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const { error, status, reminder } = await authorize(clerkId, id)
  if (error || !reminder) return NextResponse.json({ error }, { status })

  await prisma.reminder.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ success: true })
}
