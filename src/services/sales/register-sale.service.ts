import type { Prisma, PrismaClient } from '@prisma/client'
import type { AiExtractedData } from '@/types/ai-extraction'

type Db = PrismaClient | Prisma.TransactionClient

/** Extrai a quantidade (inteiro) de um texto tipo "2", "2 unidades", "duas". Default 1. */
function parseQuantity(raw: string | undefined): number {
  if (!raw) return 1
  const match = raw.match(/\d+/)
  const n = match ? parseInt(match[0], 10) : 1
  return Number.isFinite(n) && n > 0 ? n : 1
}

/**
 * Registra uma venda a partir do que a IA extraiu do atendimento (áudio ou texto).
 * Cria a Sale e, para cada produto falado, garante o Product e cria o SaleItem
 * com a quantidade capturada. Sem preço (a IA não extrai valor) → unitPrice 0.
 */
export async function registerSaleFromExtraction(
  db: Db,
  params: {
    userId: string
    clientId: string
    extracted: AiExtractedData | null
    fallbackNote?: string | null
  },
): Promise<{ saleId: string; itemsCreated: number; valorTotal: number }> {
  const { userId, clientId, extracted, fallbackNote } = params
  const produtos = extracted?.produtos ?? []
  const quantidades = extracted?.quantidades ?? []
  const valorTotal = extracted?.valorTotal ?? 0

  // quantidade total (para ratear o valor por unidade entre os itens)
  const totalQty = produtos.reduce((acc, _p, i) => acc + parseQuantity(quantidades[i]), 0)
  const unitPriceRateio = totalQty > 0 && valorTotal > 0 ? valorTotal / totalQty : 0

  const sale = await db.sale.create({
    data: {
      clientId,
      status: 'PENDING',
      total: valorTotal,
      notes: produtos.length ? produtos.join(', ') : (fallbackNote ?? null),
      aiSummary: extracted?.resumo ?? null,
    },
  })

  let itemsCreated = 0
  for (let i = 0; i < produtos.length; i++) {
    const name = produtos[i]?.trim()
    if (!name) continue
    const quantity = parseQuantity(quantidades[i])

    // Garante o produto (por nome, por usuário)
    const existing = await db.product.findFirst({
      where: { userId, name, deletedAt: null },
      select: { id: true },
    })
    const productId = existing
      ? existing.id
      : (await db.product.create({ data: { userId, name, price: unitPriceRateio }, select: { id: true } })).id

    await db.saleItem.create({
      data: { saleId: sale.id, productId, quantity, unitPrice: unitPriceRateio },
    })
    itemsCreated++
  }

  return { saleId: sale.id, itemsCreated, valorTotal }
}
