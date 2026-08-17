import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ saleId: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await resolveDbUser(userId)
  const { saleId } = await params
  const body = await req.json()

  const sale = await prisma.sale.findFirst({
    where: { id: saleId, client: { userId: user.id, deletedAt: null }, deletedAt: null },
  })
  if (!sale) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.sale.update({
    where: { id: saleId },
    data: {
      notes: body.notes ?? sale.notes,
      total: body.valorTotal !== undefined ? body.valorTotal : sale.total,
    },
  })

  return NextResponse.json({ sale: updated })
}
