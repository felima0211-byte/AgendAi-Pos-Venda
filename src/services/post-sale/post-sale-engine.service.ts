import type { Prisma, PrismaClient, ReminderKind, ReminderPriority } from '@prisma/client'
import type { AiExtractedData } from '@/types/ai-extraction'
import { getSizeProgression } from '@/lib/baby-sizes'

/**
 * ── Motor Inteligente de Pós-Venda (Fatia 11) ──
 *
 * A dor: depois que a cliente compra, a vendedora quer ser lembrada de
 * voltar a falar com ela — e a mensagem depende do que ela comprou.
 * "Comprou 18 meses? Daqui a um mês ofereço o próximo tamanho."
 *
 * Este motor, a partir de um atendimento com produtos, cria automaticamente
 * o cronograma de pós-venda, carregando em cada lembrete o CONTEXTO da compra
 * para que a mensagem (Fatia 12) já saia pronta e personalizada.
 */

export interface PurchaseContext {
  produtos: string[]
  categorias: string[]
  idadeCrianca: string | null
  tamanho: string | null
  ocasiao: string | null
  observacoes: string | null
  resumo: string | null
}

interface ReminderSpec {
  kind: ReminderKind
  dayOffset: number
  title: string
  body: string
  reason: string
  priority: ReminderPriority
  extra?: Record<string, unknown>
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Extrai o contexto de compra a partir do JSON da IA Estruturadora.
 * O "tamanho" pode vir dentro dos produtos ("macacão 18 meses") ou da idade.
 */
export function toPurchaseContext(data: AiExtractedData): PurchaseContext {
  const tamanho = detectSizeText(data)
  return {
    produtos: data.produtos ?? [],
    categorias: data.categorias ?? [],
    idadeCrianca: data.idadeCrianca ?? null,
    tamanho,
    ocasiao: data.ocasiao ?? null,
    observacoes: data.observacoes ?? null,
    resumo: data.resumo ?? null,
  }
}

/** Procura menção de tamanho nos produtos, na idade ou nas observações. */
function detectSizeText(data: AiExtractedData): string | null {
  const haystack = [
    ...(data.produtos ?? []),
    data.idadeCrianca ?? '',
    data.observacoes ?? '',
  ].join(' ')
  // devolve o trecho bruto — o parser de baby-sizes interpreta depois
  return haystack.trim() || null
}

/**
 * Monta a lista de lembretes do cronograma para um contexto de compra.
 * SIZE_UPDATE só entra quando há um tamanho de bebê reconhecível.
 */
export function buildPostSaleReminders(ctx: PurchaseContext): ReminderSpec[] {
  const produtosTxt = ctx.produtos.length ? ctx.produtos.join(', ') : 'os produtos'
  const specs: ReminderSpec[] = [
    {
      kind: 'POST_SALE_CHECK',
      dayOffset: 3,
      title: 'Confirmar se serviu',
      body: `Perguntar se ${produtosTxt} serviu certinho.`,
      reason: 'Pós-venda +3 dias: garantir que o produto agradou.',
      priority: 'MEDIUM',
    },
    {
      kind: 'EXCHANGE_CHECK',
      dayOffset: 15,
      title: 'Verificar necessidade de troca',
      body: `Checar se ficou tudo certo ou se precisa trocar algo de ${produtosTxt}.`,
      reason: 'Pós-venda +15 dias: janela de troca.',
      priority: 'MEDIUM',
    },
    {
      kind: 'RECOMMEND',
      dayOffset: 30,
      title: 'Sugerir novos produtos',
      body: buildRecommendBody(ctx),
      reason: 'Pós-venda +30 dias: oferecer itens relacionados ao que comprou.',
      priority: 'MEDIUM',
    },
    {
      kind: 'REACTIVATE',
      dayOffset: 60,
      title: 'Reativar relacionamento',
      body: 'Mandar um oi, manter o vínculo mesmo sem venda.',
      reason: 'Pós-venda +60 dias: nutrir o relacionamento.',
      priority: 'LOW',
    },
    {
      kind: 'WINBACK',
      dayOffset: 90,
      title: 'Nova abordagem',
      body: 'Se ainda não comprou de novo, tentar uma abordagem diferente.',
      reason: 'Pós-venda +90 dias: recuperar cliente sem recompra.',
      priority: 'LOW',
    },
  ]

  // Progressão de tamanho — o diferencial da dor
  const progression = getSizeProgression(ctx.tamanho)
  if (progression?.next) {
    specs.push({
      kind: 'SIZE_UPDATE',
      dayOffset: 30,
      title: `Oferecer próximo tamanho: ${progression.next.label}`,
      body: `Comprou ${progression.current.label}. O bebê já deve estar crescendo — oferecer ${progression.next.label}.`,
      reason: `Progressão de tamanho: ${progression.current.label} → ${progression.next.label}.`,
      priority: 'HIGH',
      extra: {
        sizeFrom: progression.current.label,
        sizeTo: progression.next.label,
      },
    })
  }

  return specs
}

function buildRecommendBody(ctx: PurchaseContext): string {
  if (ctx.categorias.length) {
    return `Oferecer novidades de ${ctx.categorias.join(', ')} combinando com o que já comprou.`
  }
  return 'Oferecer novidades relacionadas ao que ela já comprou.'
}

interface CreateScheduleArgs {
  prisma: PrismaClient | Prisma.TransactionClient
  clientId: string
  interactionId?: string | null
  saleId?: string | null
  context: PurchaseContext
  now?: Date
}

/**
 * Cria (de forma idempotente) o cronograma completo de pós-venda.
 * Se já existirem lembretes gerados para este atendimento, não duplica.
 */
export async function createPostSaleSchedule({
  prisma,
  clientId,
  interactionId = null,
  saleId = null,
  context,
  now = new Date(),
}: CreateScheduleArgs) {
  // idempotência: já gerou para este atendimento?
  if (interactionId) {
    const existing = await prisma.reminder.count({
      where: { interactionId, aiGenerated: true, deletedAt: null },
    })
    if (existing > 0) return { created: 0, skipped: true }
  }

  const specs = buildPostSaleReminders(context)

  await prisma.reminder.createMany({
    data: specs.map((spec) => ({
      clientId,
      interactionId,
      saleId,
      kind: spec.kind,
      title: spec.title,
      body: spec.body,
      dueAt: new Date(now.getTime() + spec.dayOffset * DAY_MS),
      priority: spec.priority,
      aiGenerated: true,
      aiReason: spec.reason,
      metadata: {
        dayOffset: spec.dayOffset,
        produtos: context.produtos,
        categorias: context.categorias,
        idadeCrianca: context.idadeCrianca,
        ocasiao: context.ocasiao,
        ...(spec.extra ?? {}),
      } as Prisma.InputJsonValue,
    })),
  })

  return { created: specs.length, skipped: false }
}

/**
 * Quando há uma nova compra, os lembretes de reativação/winback do
 * atendimento anterior perdem o sentido — a cliente voltou a comprar.
 * Cancela os pendentes desses tipos (exceto os do próprio atendimento novo).
 */
export async function cancelStaleWinbacks({
  prisma,
  clientId,
  keepInteractionId,
}: {
  prisma: PrismaClient | Prisma.TransactionClient
  clientId: string
  keepInteractionId?: string | null
}) {
  await prisma.reminder.updateMany({
    where: {
      clientId,
      status: { in: ['PENDING', 'SNOOZED'] },
      kind: { in: ['REACTIVATE', 'WINBACK'] },
      deletedAt: null,
      ...(keepInteractionId ? { NOT: { interactionId: keepInteractionId } } : {}),
    },
    data: { status: 'CANCELLED' },
  })
}
