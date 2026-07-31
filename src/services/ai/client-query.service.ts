import Groq from 'groq-sdk'
import type { Prisma, PrismaClient } from '@prisma/client'
import type { AiExtractedData } from '@/types/ai-extraction'

/**
 * ── Motor de Consulta de Clientes (base das Fatias 13 e 14) ──
 *
 * Traduz uma pergunta em linguagem natural em filtros estruturados (via IA) e
 * depois consulta o banco. NUNCA inventa dados — só devolve o que existe.
 * Filtros nativos vão para o Prisma; filtros que dependem do JSON do atendimento
 * (produto, comprador, idade, ocasião) são aplicados em memória sobre dados reais.
 */

export interface ClientQueryFilters {
  daysSincePurchaseMin?: number
  daysSincePurchaseMax?: number
  childAgeMonthsMin?: number
  childAgeMonthsMax?: number
  status?: 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'VIP'
  buyerType?: string
  productContains?: string
  categoryContains?: string
  occasion?: string
  hasPendingPostSale?: boolean
  tag?: string
  sortBy?: 'most_purchases' | 'recent' | 'oldest_contact'
  limit?: number
}

export interface QueryInterpretation {
  intent: 'search_clients' | 'unknown'
  filters: ClientQueryFilters
  humanInterpretation: string
}

export interface ClientResult {
  id: string
  name: string
  phone: string | null
  status: string
  lastActivity: string | null
  daysSincePurchase: number | null
  salesCount: number
  matchReason: string
}

const DAY_MS = 24 * 60 * 60 * 1000

function log(level: 'info' | 'warn' | 'error', msg: string, meta?: object) {
  console[level === 'info' ? 'log' : level](
    JSON.stringify({ ts: new Date().toISOString(), service: 'ClientQuery', level, msg, ...meta }),
  )
}

const INTERPRETER_PROMPT = `Você converte perguntas de uma vendedora de moda infantil em filtros de busca JSON sobre a base de clientes dela.

Responda APENAS com JSON válido no schema abaixo. Não invente dados.

SCHEMA:
{
  "intent": "search_clients" | "unknown",
  "filters": {
    "daysSincePurchaseMin": number | null,   // ex: "há mais de 60 dias" -> 60
    "daysSincePurchaseMax": number | null,
    "childAgeMonthsMin": number | null,       // "bebê de 1 ano" -> ~10..14
    "childAgeMonthsMax": number | null,
    "status": "ACTIVE" | "INACTIVE" | "PROSPECT" | "VIP" | null,
    "buyerType": string | null,               // "avó", "mãe", "tia"
    "productContains": string | null,         // "manta", "kit banho", "macacão"
    "categoryContains": string | null,
    "occasion": string | null,                // "presente", "neto", "aniversário"
    "hasPendingPostSale": boolean | null,      // "não respondeu pós-venda"
    "tag": string | null,
    "sortBy": "most_purchases" | "recent" | "oldest_contact" | null,
    "limit": number | null
  },
  "humanInterpretation": string  // frase curta em pt-BR explicando o que será buscado
}

REGRAS:
- Campos não mencionados = null
- "quem devo chamar/priorizar hoje" -> oldest_contact + hasPendingPostSale se fizer sentido
- "quem compra mais" -> sortBy: most_purchases
- Se a pergunta não for sobre buscar clientes, intent = "unknown"`

/** Interpreta a pergunta em filtros usando a IA. */
export async function interpretQuery(question: string): Promise<QueryInterpretation> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY não configurada')

  const client = new Groq({ apiKey, timeout: 30_000 })
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: INTERPRETER_PROMPT },
      { role: 'user', content: question },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
    max_tokens: 500,
  })

  const raw = response.choices[0]?.message?.content ?? '{}'
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { intent: 'unknown', filters: {}, humanInterpretation: 'Não entendi a pergunta.' }
  }

  const f = (parsed.filters ?? {}) as Record<string, unknown>
  const num = (v: unknown) => (typeof v === 'number' ? v : undefined)
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

  const filters: ClientQueryFilters = {
    daysSincePurchaseMin: num(f.daysSincePurchaseMin),
    daysSincePurchaseMax: num(f.daysSincePurchaseMax),
    childAgeMonthsMin: num(f.childAgeMonthsMin),
    childAgeMonthsMax: num(f.childAgeMonthsMax),
    status: ['ACTIVE', 'INACTIVE', 'PROSPECT', 'VIP'].includes(f.status as string)
      ? (f.status as ClientQueryFilters['status'])
      : undefined,
    buyerType: str(f.buyerType),
    productContains: str(f.productContains),
    categoryContains: str(f.categoryContains),
    occasion: str(f.occasion),
    hasPendingPostSale: typeof f.hasPendingPostSale === 'boolean' ? f.hasPendingPostSale : undefined,
    tag: str(f.tag),
    sortBy: ['most_purchases', 'recent', 'oldest_contact'].includes(f.sortBy as string)
      ? (f.sortBy as ClientQueryFilters['sortBy'])
      : undefined,
    limit: num(f.limit),
  }

  return {
    intent: parsed.intent === 'search_clients' ? 'search_clients' : 'unknown',
    filters,
    humanInterpretation: str(parsed.humanInterpretation) ?? 'Buscando na sua base de clientes.',
  }
}

/** Extrai a idade em meses a partir do texto livre de idadeCrianca. */
function ageToMonths(text: string | null | undefined): number | null {
  if (!text) return null
  const t = text.toLowerCase()
  const meses = t.match(/(\d{1,2})\s*(?:mes|meses|m\b)/)
  if (meses) return parseInt(meses[1])
  const anos = t.match(/(\d{1,2})\s*(?:ano|anos|a\b)/)
  if (anos) return parseInt(anos[1]) * 12
  return null
}

/** Executa a consulta real no banco + pós-filtro sobre dados do atendimento. */
export async function runClientQuery(
  prisma: PrismaClient,
  userId: string,
  filters: ClientQueryFilters,
): Promise<ClientResult[]> {
  const where: Prisma.ClientWhereInput = {
    userId,
    deletedAt: null,
    ...(filters.status && { status: filters.status }),
    ...(filters.tag && { tags: { has: filters.tag } }),
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      sales: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { sales: true } },
      interactions: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      reminders: {
        where: { deletedAt: null, aiGenerated: true, status: { in: ['PENDING', 'SNOOZED'] } },
        select: { id: true },
      },
    },
    take: 300,
  })

  const now = Date.now()
  const results: ClientResult[] = []

  for (const c of clients) {
    const lastActivity = c.sales[0]?.createdAt ?? c.interactions[0]?.createdAt ?? null
    const days = lastActivity ? Math.floor((now - new Date(lastActivity).getTime()) / DAY_MS) : null
    const extracted = c.interactions[0]?.aiExtractedData as unknown as AiExtractedData | null
    const reasons: string[] = []

    // Filtros por tempo
    if (filters.daysSincePurchaseMin != null) {
      if (days == null || days < filters.daysSincePurchaseMin) continue
      reasons.push(`${days} dias sem comprar`)
    }
    if (filters.daysSincePurchaseMax != null) {
      if (days == null || days > filters.daysSincePurchaseMax) continue
    }

    // Pós-venda pendente
    if (filters.hasPendingPostSale === true && c.reminders.length === 0) continue
    if (filters.hasPendingPostSale === true) reasons.push('pós-venda pendente')

    // Filtros sobre o atendimento (dados reais)
    const hay = (extracted
      ? [...(extracted.produtos ?? []), ...(extracted.categorias ?? []), extracted.ocasiao ?? '', extracted.comprador ?? '', extracted.observacoes ?? '']
      : []
    ).join(' ').toLowerCase()

    if (filters.productContains && !hay.includes(filters.productContains.toLowerCase())) continue
    if (filters.productContains) reasons.push(`comprou ${filters.productContains}`)

    if (filters.categoryContains && !hay.includes(filters.categoryContains.toLowerCase())) continue
    if (filters.occasion && !hay.includes(filters.occasion.toLowerCase())) continue
    if (filters.occasion) reasons.push(filters.occasion)

    if (filters.buyerType) {
      const buyer = (extracted?.comprador ?? '').toLowerCase()
      if (!buyer.includes(filters.buyerType.toLowerCase())) continue
      reasons.push(filters.buyerType)
    }

    // Idade da criança
    if (filters.childAgeMonthsMin != null || filters.childAgeMonthsMax != null) {
      const months = ageToMonths(extracted?.idadeCrianca)
      if (months == null) continue
      if (filters.childAgeMonthsMin != null && months < filters.childAgeMonthsMin) continue
      if (filters.childAgeMonthsMax != null && months > filters.childAgeMonthsMax) continue
      reasons.push(`criança ~${months} meses`)
    }

    results.push({
      id: c.id,
      name: c.name,
      phone: c.phone,
      status: c.status,
      lastActivity: lastActivity ? new Date(lastActivity).toISOString() : null,
      daysSincePurchase: days,
      salesCount: c._count.sales,
      matchReason: reasons.join(' · ') || 'corresponde à busca',
    })
  }

  // Ordenação
  switch (filters.sortBy) {
    case 'most_purchases':
      results.sort((a, b) => b.salesCount - a.salesCount)
      break
    case 'oldest_contact':
      results.sort((a, b) => (b.daysSincePurchase ?? -1) - (a.daysSincePurchase ?? -1))
      break
    case 'recent':
    default:
      results.sort((a, b) => (a.daysSincePurchase ?? 99999) - (b.daysSincePurchase ?? 99999))
  }

  const limit = filters.limit && filters.limit > 0 ? filters.limit : 50
  log('info', 'Consulta executada', { userId, encontrados: results.length })
  return results.slice(0, limit)
}
