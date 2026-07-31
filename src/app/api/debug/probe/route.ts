import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// TEMPORÁRIO: testa o caminho de ESCRITA no banco a partir do runtime (Vercel).
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (new URL(req.url).searchParams.get('k') !== 'agendai-probe-9x') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const steps: Record<string, unknown> = {}
  try {
    const user = await prisma.user.findFirst({ select: { id: true } })
    steps.user = user?.id ?? null
    if (!user) return NextResponse.json({ ok: false, steps, error: 'no user' })

    const client = await prisma.client.create({ data: { userId: user.id, name: 'PROBE_TMP', status: 'ACTIVE' } })
    steps.clientCreated = client.id

    const product = await prisma.product.create({ data: { userId: user.id, name: 'PROBE_PROD', price: 0 } })
    steps.productCreated = product.id

    const sale = await prisma.sale.create({ data: { clientId: client.id, status: 'PENDING', total: 0 } })
    steps.saleCreated = sale.id

    const item = await prisma.saleItem.create({ data: { saleId: sale.id, productId: product.id, quantity: 1, unitPrice: 0 } })
    steps.saleItemCreated = item.id

    // limpeza
    await prisma.saleItem.delete({ where: { id: item.id } })
    await prisma.sale.delete({ where: { id: sale.id } })
    await prisma.product.delete({ where: { id: product.id } })
    await prisma.client.delete({ where: { id: client.id } })
    steps.cleaned = true

    return NextResponse.json({ ok: true, steps })
  } catch (err) {
    return NextResponse.json({ ok: false, steps, error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
