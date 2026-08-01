import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

/**
 * GET /api/assistant/history          — lista conversas (com últimas mensagens)
 * GET /api/assistant/history?id=xxx   — mensagens de uma conversa
 */
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const id = new URL(req.url).searchParams.get('id')

  if (id) {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: dbUser.id, deletedAt: null },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!conversation) return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    return NextResponse.json(conversation)
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: dbUser.id, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    take: 30,
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { messages: true } },
    },
  })

  return NextResponse.json({ items: conversations })
}

/**
 * DELETE /api/assistant/history        — apaga todo o histórico
 * DELETE /api/assistant/history?id=xxx — apaga uma conversa
 */
export async function DELETE(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const id = new URL(req.url).searchParams.get('id')

  if (id) {
    await prisma.conversation.updateMany({
      where: { id, userId: dbUser.id },
      data: { deletedAt: new Date() },
    })
  } else {
    await prisma.conversation.updateMany({
      where: { userId: dbUser.id, deletedAt: null },
      data: { deletedAt: new Date() },
    })
  }

  return NextResponse.json({ success: true })
}
