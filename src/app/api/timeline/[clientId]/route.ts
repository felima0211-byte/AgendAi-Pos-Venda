import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

export async function GET(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { clientId } = await params
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 100)

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: dbUser.id, deletedAt: null },
  })
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const events = await prisma.timelineEvent.findMany({
    where: { clientId },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      sale: { select: { id: true, total: true, status: true } },
    },
  })

  const hasMore = events.length > limit
  const items = hasMore ? events.slice(0, -1) : events
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return NextResponse.json({ items, hasMore, nextCursor })
}
