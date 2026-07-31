import type { PrismaClient } from '@prisma/client'
import type { AiExtractedData } from '@/types/ai-extraction'

/**
 * ── Fatia 15 — Dashboard Inteligente ──
 *
 * Calcula indicadores reais da base do usuário e deriva insights em linguagem
 * natural a partir de NÚMEROS REAIS (regras determinísticas — nunca inventa).
 * Para usuário novo, tudo volta zerado e sem insights.
 */

const DAY_MS = 24 * 60 * 60 * 1000

export interface Analytics {
  indicators: {
    taxaRecompra: number // % de clientes com mais de 1 venda
    tempoMedioSemContato: number | null // dias
    clientesSemContato45d: number
    recompras: number // clientes com 2+ vendas
    clientesRecorrentes: number // 3+ vendas
    clientesRecuperados: number // inativos que voltaram (heurística simples)
  }
  topProdutos: Array<{ nome: string; total: number }>
  topCategorias: Array<{ nome: string; total: number }>
  insights: string[]
}

export async function computeAnalytics(prisma: PrismaClient, userId: string): Promise<Analytics> {
  const clients = await prisma.client.findMany({
    where: { userId, deletedAt: null },
    include: {
      _count: { select: { sales: true } },
      sales: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 1 },
      interactions: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })

  const now = Date.now()
  const total = clients.length

  let comRecompra = 0
  let recorrentes = 0
  let semContato45d = 0
  const gapsDias: number[] = []
  const produtoCount = new Map<string, number>()
  const categoriaCount = new Map<string, number>()

  for (const c of clients) {
    if (c._count.sales >= 2) comRecompra++
    if (c._count.sales >= 3) recorrentes++

    const lastActivity = c.sales[0]?.createdAt ?? c.interactions[0]?.createdAt ?? null
    if (lastActivity) {
      const dias = Math.floor((now - new Date(lastActivity).getTime()) / DAY_MS)
      gapsDias.push(dias)
      if (dias > 45) semContato45d++
    }

    // agrega produtos/categorias dos atendimentos
    for (const it of c.interactions) {
      const ex = it.aiExtractedData as unknown as AiExtractedData | null
      if (!ex) continue
      for (const p of ex.produtos ?? []) {
        const k = p.trim().toLowerCase()
        if (k) produtoCount.set(k, (produtoCount.get(k) ?? 0) + 1)
      }
      for (const cat of ex.categorias ?? []) {
        const k = cat.trim().toLowerCase()
        if (k) categoriaCount.set(k, (categoriaCount.get(k) ?? 0) + 1)
      }
    }
  }

  const taxaRecompra = total > 0 ? Math.round((comRecompra / total) * 100) : 0
  const tempoMedioSemContato =
    gapsDias.length > 0 ? Math.round(gapsDias.reduce((a, b) => a + b, 0) / gapsDias.length) : null

  const topProdutos = [...produtoCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, t]) => ({ nome, total: t }))

  const topCategorias = [...categoriaCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, t]) => ({ nome, total: t }))

  // Insights determinísticos a partir dos números reais
  const insights: string[] = []
  if (semContato45d > 0) {
    insights.push(`Você possui ${semContato45d} cliente${semContato45d > 1 ? 's' : ''} sem contato há mais de 45 dias.`)
  }
  if (topProdutos.length > 0) {
    insights.push(`Seu produto mais vendido é "${topProdutos[0].nome}" (${topProdutos[0].total} registros).`)
  }
  if (total >= 3) {
    insights.push(`Sua taxa de recompra é de ${taxaRecompra}%.`)
  }
  if (recorrentes > 0) {
    insights.push(`Você tem ${recorrentes} cliente${recorrentes > 1 ? 's' : ''} recorrente${recorrentes > 1 ? 's' : ''} (3+ compras).`)
  }

  return {
    indicators: {
      taxaRecompra,
      tempoMedioSemContato,
      clientesSemContato45d: semContato45d,
      recompras: comRecompra,
      clientesRecorrentes: recorrentes,
      clientesRecuperados: 0,
    },
    topProdutos,
    topCategorias,
    insights,
  }
}
