import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const event = await prisma.timelineEvent.findFirst({
    where: { id },
    include: { client: true },
  })

  if (!event) return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
  if (event.client.userId !== dbUser.id) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  // Soft delete via metadata flag (eventos nunca são editados conforme regra)
  await prisma.timelineEvent.update({
    where: { id },
    data: { metadata: { ...(event.metadata as object ?? {}), deletedAt: new Date().toISOString() } },
  })

  return NextResponse.json({ success: true })
}
