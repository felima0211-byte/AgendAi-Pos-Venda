import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

/**
 * GET /api/analytics/vendas
 * Consolidado de vendas do usuário (todas, sem janela):
 *  - total de vendas
 *  - itens vendidos agregados (produto → quantidade)
 *  - por cliente: vendas e itens (confirmação cruzada com a aba de clientes)
 */
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)

  const sales = await prisma.sale.findMany({
    where: { deletedAt: null, client: { userId: dbUser.id, deletedAt: null } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      clientId: true,
      createdAt: true,
      total: true,
      client: { select: { name: true } },
      items: { select: { quantity: true, product: { select: { name: true } } } },
    },
  })

  const totalFaturamento = sales.reduce((acc, s) => acc + Number(s.total), 0)

  const itensMap = new Map<string, number>()
  const clientesMap = new Map<string, { clientId: string; name: string; vendas: number; itens: Map<string, number> }>()

  for (const s of sales) {
    let c = clientesMap.get(s.clientId)
    if (!c) {
      c = { clientId: s.clientId, name: s.client.name, vendas: 0, itens: new Map() }
      clientesMap.set(s.clientId, c)
    }
    c.vendas++
    for (const it of s.items) {
      itensMap.set(it.product.name, (itensMap.get(it.product.name) ?? 0) + it.quantity)
      c.itens.set(it.product.name, (c.itens.get(it.product.name) ?? 0) + it.quantity)
    }
  }

  const itens = [...itensMap.entries()]
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)

  const porCliente = [...clientesMap.values()]
    .map((c) => ({
      clientId: c.clientId,
      name: c.name,
      vendas: c.vendas,
      itens: [...c.itens.entries()].map(([nome, quantidade]) => ({ nome, quantidade })).sort((a, b) => b.quantidade - a.quantidade),
    }))
    .sort((a, b) => b.vendas - a.vendas)

  return NextResponse.json({
    totalVendas: sales.length,
    totalItens: itens.reduce((acc, i) => acc + i.quantidade, 0),
    totalFaturamento,
    itens,
    porCliente,
  })
}
