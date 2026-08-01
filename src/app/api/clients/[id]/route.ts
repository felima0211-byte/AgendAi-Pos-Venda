import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

type Params = Promise<{ id: string }>

async function getAuthorizedClient(clerkId: string, clientId: string) {
  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return { error: 'Usuário não encontrado', status: 404, dbUser: null, client: null }

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: dbUser.id, deletedAt: null },
  })
  if (!client) return { error: 'Cliente não encontrado', status: 404, dbUser, client: null }

  return { error: null, status: 200, dbUser, client }
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const { error, status, client } = await getAuthorizedClient(clerkId, id)
  if (error) return NextResponse.json({ error }, { status })

  const full = await prisma.client.findUnique({
    where: { id },
    include: {
      children: { where: { deletedAt: null } },
      sales: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      },
      reminders: { where: { deletedAt: null }, orderBy: { dueAt: 'asc' } },
      interactions: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { audio: true },
      },
      timelineEvents: { orderBy: { createdAt: 'desc' }, take: 20 },
      _count: { select: { sales: true, reminders: true, interactions: true } },
    },
  })

  return NextResponse.json(full)
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const { error, status, client } = await getAuthorizedClient(clerkId, id)
  if (error || !client) return NextResponse.json({ error }, { status })

  const body = await req.json()
  const { name, phone, email, address, city, birthDate, notes, tags, clientStatus } = body

  const updated = await prisma.client.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone?.trim() ?? null }),
      ...(email !== undefined && { email: email?.trim() ?? null }),
      ...(address !== undefined && { address: address?.trim() ?? null }),
      ...(city !== undefined && { city: city?.trim() ?? null }),
      ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
      ...(notes !== undefined && { notes: notes?.trim() ?? null }),
      ...(tags !== undefined && { tags }),
      ...(clientStatus && { status: clientStatus }),
    },
  })

  await prisma.timelineEvent.create({
    data: {
      clientId: id,
      type: 'CLIENT_UPDATED',
      title: 'Dados atualizados',
      body: 'Informações do cliente foram atualizadas.',
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const { error, status, client } = await getAuthorizedClient(clerkId, id)
  if (error || !client) return NextResponse.json({ error }, { status })

  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
