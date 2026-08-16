import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

const DIAS_SEM_COMPRA = 30

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const limite = new Date()
  limite.setDate(limite.getDate() - DIAS_SEM_COMPRA)

  // Clientes ativos que não compram há mais de 30 dias
  const clientes = await prisma.client.findMany({
    where: { userId: dbUser.id, deletedAt: null, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      sales: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  })

  const now = new Date()
  const alertas = clientes
    .filter((c) => {
      const ultima = c.sales[0]?.createdAt
      if (!ultima) return true // nunca comprou
      return ultima < limite
    })
    .map((c) => {
      const ultima = c.sales[0]?.createdAt ?? null
      const diasSemCompra = ultima
        ? Math.floor((now.getTime() - new Date(ultima).getTime()) / 86_400_000)
        : null
      return {
        clientId: c.id,
        clientName: c.name,
        diasSemCompra: diasSemCompra ?? DIAS_SEM_COMPRA,
        ultimaCompra: ultima ? ultima.toISOString() : null,
      }
    })
    .sort((a, b) => b.diasSemCompra - a.diasSemCompra)
    .slice(0, 10)

  return NextResponse.json({ alertas })
}
