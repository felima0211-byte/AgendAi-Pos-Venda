import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await req.json()
  const { clientId, type, title, body: eventBody, saleId, metadata } = body

  if (!clientId || !type || !title) {
    return NextResponse.json({ error: 'clientId, type e title são obrigatórios' }, { status: 400 })
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: dbUser.id, deletedAt: null },
  })
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const event = await prisma.timelineEvent.create({
    data: {
      clientId,
      type,
      title: title.trim(),
      body: eventBody?.trim() ?? null,
      saleId: saleId ?? null,
      metadata: metadata ?? null,
    },
  })

  return NextResponse.json(event, { status: 201 })
}
