import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { generateMessageSchema } from '@/lib/api/schemas'
import { NotFoundError } from '@/lib/api/errors'
import { generateMessage } from '@/services/ai/message-generator.service'
import type { MessageContext, MessageType } from '@/types/message'
import type { AiExtractedData } from '@/types/ai-extraction'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * POST /api/messages/generate  { clientId, type, reminderId? }
 * Gera mensagem de WhatsApp personalizada com o histórico real do cliente.
 * Camadas 2+4: auth, validação, rate limit, posse multi-tenant.
 */
export const POST = withAuth(
  { bodySchema: generateMessageSchema, rateLimit: { name: 'gen-message', limit: 30, windowMs: 60_000 } },
  async ({ userId, body }) => {
    const { clientId, type, reminderId } = body

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId, deletedAt: null },
      include: {
        interactions: {
          where: { deletedAt: null, aiExtractedData: { not: undefined } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        sales: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
    if (!client) throw new NotFoundError('Cliente não encontrado')

    let tamanhoSugerido: string | null = null
    if (reminderId) {
      const reminder = await prisma.reminder.findFirst({ where: { id: reminderId, clientId, deletedAt: null } })
      const meta = reminder?.metadata as { sizeTo?: string } | null
      tamanhoSugerido = meta?.sizeTo ?? null
    }

    const extracted = client.interactions[0]?.aiExtractedData as unknown as AiExtractedData | null
    const lastActivity = client.sales[0]?.createdAt ?? client.interactions[0]?.createdAt ?? null
    const diasSemComprar = lastActivity
      ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / DAY_MS)
      : null

    const ctx: MessageContext = {
      clienteNome: client.name.split(' ')[0],
      comprador: extracted?.comprador ?? null,
      idadeCrianca: extracted?.idadeCrianca ?? null,
      produtos: extracted?.produtos ?? [],
      categorias: extracted?.categorias ?? client.aiKeywords ?? [],
      tamanhoSugerido,
      ultimaCompra: lastActivity ? new Date(lastActivity).toLocaleDateString('pt-BR') : null,
      diasSemComprar,
      observacoes: extracted?.observacoes ?? client.notes ?? null,
    }

    let content: string
    let model: string
    try {
      const result = await generateMessage(type as MessageType, ctx)
      content = result.content
      model = result.model
    } catch (aiErr) {
      console.error(JSON.stringify({
        ts: new Date().toISOString(),
        scope: 'messages/generate',
        error: aiErr instanceof Error ? aiErr.message : String(aiErr),
      }))
      throw new Error(
        aiErr instanceof Error && aiErr.message.includes('GROQ_API_KEY')
          ? 'Chave de IA não configurada. Contate o suporte.'
          : 'Não foi possível gerar a mensagem. Tente novamente em alguns segundos.',
      )
    }

    const saved = await prisma.generatedMessage.create({
      data: { clientId, reminderId: reminderId ?? null, type: type as MessageType, content, model },
    })

    return apiSuccess({ id: saved.id, content, type })
  },
)
