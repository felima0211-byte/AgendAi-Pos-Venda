import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await req.json()
  const { clientId, produtos, valorTotal, observacao } = body

  if (!clientId) return NextResponse.json({ error: 'clientId obrigatório' }, { status: 400 })

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: dbUser.id, deletedAt: null },
  })
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const total = Number(valorTotal) || 0
  const itens: Array<{ name: string; quantity: number }> = produtos ?? []
  const totalQty = itens.reduce((acc, it) => acc + it.quantity, 0)
  const unitPrice = totalQty > 0 && total > 0 ? total / totalQty : 0

  const sale = await prisma.sale.create({
    data: {
      clientId,
      status: 'PENDING',
      total,
      notes: itens.length ? itens.map(i => i.name).join(', ') : (observacao ?? null),
    },
  })

  for (const item of itens) {
    const name = item.name.trim()
    if (!name) continue
    const existing = await prisma.product.findFirst({
      where: { userId: dbUser.id, name, deletedAt: null },
    })
    const productId = existing
      ? existing.id
      : (await prisma.product.create({ data: { userId: dbUser.id, name, price: unitPrice } })).id

    await prisma.saleItem.create({
      data: { saleId: sale.id, productId, quantity: item.quantity, unitPrice },
    })
  }

  await prisma.timelineEvent.create({
    data: {
      clientId,
      type: 'SALE_CREATED',
      title: 'Nova venda registrada',
      body: itens.length
        ? itens.map(i => `${i.name} ×${i.quantity}`).join(', ')
        : (observacao ?? 'Venda manual'),
    },
  })

  return NextResponse.json({ saleId: sale.id }, { status: 201 })
}
