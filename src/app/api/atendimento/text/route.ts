import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { NotFoundError } from '@/lib/api/errors'
import { textAtendimentoSchema } from '@/lib/api/schemas'
import { structureTranscription } from '@/services/ai/ai-structurer.service'
import { registerSaleFromExtraction } from '@/services/sales/register-sale.service'
import {
  createPostSaleSchedule,
  cancelStaleWinbacks,
  toPurchaseContext,
} from '@/services/post-sale/post-sale-engine.service'

/**
 * POST /api/atendimento/text  { clientId?, text }
 *
 * MVP Core — caminho por TEXTO (irmão do /api/audio/upload).
 * A vendedora digita o relato do atendimento; a IA estrutura os dados,
 * cria/atualiza a cliente e dispara o cronograma de pós-venda.
 * Camadas 2+4: auth, validação, rate limit, posse multi-tenant.
 */
export const POST = withAuth(
  { bodySchema: textAtendimentoSchema, rateLimit: { name: 'atendimento-text', limit: 20, windowMs: 60_000 } },
  async ({ userId, body }) => {
    const { clientId, text } = body

    // ── Resolver cliente (posse) ou usar "Atendimento Avulso" ──
    let resolvedClientId = clientId ?? null
    let clientAutoCreated = false
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId, deletedAt: null },
        select: { id: true },
      })
      if (!client) throw new NotFoundError('Cliente não encontrado')
    } else {
      resolvedClientId = await getOrCreateAvulsoClient(userId)
      clientAutoCreated = true
    }

    // ── Registrar interação (texto vai em aiTranscription, entrada da IA) ──
    const interaction = await prisma.interaction.create({
      data: {
        clientId: resolvedClientId!,
        type: 'OTHER',
        notes: text,
        aiTranscription: text,
        aiKeywords: [],
      },
    })

    // ── IA Estruturadora ──
    let extractedData = null
    let remindersCreated = 0
    let saleCreated = false
    let itemsCreated = 0
    try {
      extractedData = await structureTranscription(text, interaction.id)

      await prisma.interaction.update({
        where: { id: interaction.id },
        data: {
          aiExtractedData: extractedData as object,
          aiProcessedAt: new Date(),
          aiSummary: extractedData.resumo,
          aiKeywords: [
            ...(extractedData.produtos ?? []),
            ...(extractedData.categorias ?? []),
          ].slice(0, 10),
        },
      })

      if (extractedData.cliente) {
        await prisma.client.update({
          where: { id: resolvedClientId! },
          data: {
            ...(clientAutoCreated && { name: extractedData.cliente }),
            ...(extractedData.telefone && { phone: extractedData.telefone }),
            aiSummary: extractedData.resumo,
            aiKeywords: extractedData.categorias ?? [],
            lastAiSync: new Date(),
          },
        })
      }

      // ── Registrar venda + itens vendidos (produto + quantidade) ──
      const sale = await registerSaleFromExtraction(prisma, {
        userId,
        clientId: resolvedClientId!,
        extracted: extractedData,
        fallbackNote: text,
      })
      await prisma.interaction.update({ where: { id: interaction.id }, data: { saleId: sale.saleId } })
      saleCreated = true
      itemsCreated = sale.itemsCreated

      // ── Motor de Pós-Venda (se houve compra) ──
      if (extractedData.produtos?.length) {
        const result = await createPostSaleSchedule({
          prisma,
          clientId: resolvedClientId!,
          interactionId: interaction.id,
          context: toPurchaseContext(extractedData),
        })
        remindersCreated = result.created

        await cancelStaleWinbacks({
          prisma,
          clientId: resolvedClientId!,
          keepInteractionId: interaction.id,
        })

        if (result.created > 0) {
          await prisma.timelineEvent.create({
            data: {
              clientId: resolvedClientId!,
              type: 'AI_INSIGHT',
              title: 'Pós-venda agendado',
              body: `${result.created} lembretes de acompanhamento criados automaticamente.`,
              aiGenerated: true,
            },
          })
        }
      }
    } catch {
      // Guardado: falha da IA nunca perde o atendimento registrado.
    }

    // ── Timeline do atendimento ──
    await prisma.timelineEvent.create({
      data: {
        clientId: resolvedClientId!,
        type: 'INTERACTION_REGISTERED',
        title: extractedData?.cliente ? `Atendimento — ${extractedData.cliente}` : 'Atendimento registrado',
        body: extractedData?.resumo ?? `"${text.slice(0, 120)}${text.length > 120 ? '…' : ''}"`,
        aiGenerated: !!extractedData,
        aiInsight: extractedData?.possivelOportunidade ?? null,
      },
    })

    return apiSuccess({
      interactionId: interaction.id,
      clientId: resolvedClientId,
      extractedData,
      remindersCreated,
      saleCreated,
      itemsCreated,
    }, 201)
  },
)

async function getOrCreateAvulsoClient(userId: string): Promise<string> {
  const existing = await prisma.client.findFirst({
    where: { userId, name: 'Atendimento Avulso', deletedAt: null },
    select: { id: true },
  })
  if (existing) return existing.id
  const created = await prisma.client.create({
    data: { userId, name: 'Atendimento Avulso', status: 'ACTIVE' },
  })
  return created.id
}
