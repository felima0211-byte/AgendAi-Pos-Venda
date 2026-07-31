import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { createClientSchema } from '@/lib/api/schemas'

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? undefined
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

  const where = {
    userId: dbUser.id,
    deletedAt: null,
    ...(status && { status: status as 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'VIP' }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { phone: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
        { tags: { has: q } },
      ],
    }),
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { sales: true, reminders: true } },
        sales: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true, total: true, status: true },
        },
      },
    }),
    prisma.client.count({ where }),
  ])

  const hasMore = clients.length > limit
  const items = hasMore ? clients.slice(0, -1) : clients
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return NextResponse.json({ items, total, nextCursor, hasMore })
}

export const POST = withAuth(
  { bodySchema: createClientSchema, rateLimit: { name: 'create-client', limit: 40, windowMs: 60_000 } },
  async ({ userId, body }) => {
    const { name, phone, email, address, city, birthDate, notes, tags, status } = body

    const client = await prisma.client.create({
      data: {
        userId,
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        notes: notes || null,
        tags: tags ?? [],
        status: status ?? 'ACTIVE',
      },
    })

    await prisma.timelineEvent.create({
      data: {
        clientId: client.id,
        type: 'CLIENT_UPDATED',
        title: 'Cliente cadastrado',
        body: `${client.name} adicionada à base de clientes.`,
      },
    })

    return apiSuccess(client, 201)
  },
)
