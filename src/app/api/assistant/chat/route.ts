import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { assistantChatSchema } from '@/lib/api/schemas'
import { interpretQuery, runClientQuery } from '@/services/ai/client-query.service'
import { answerQuestion } from '@/services/ai/assistant.service'

/**
 * POST /api/assistant/chat  { message, conversationId? }
 * Interpreta, consulta o banco do usuário e responde em linguagem natural.
 * Camadas 2+4: auth, validação, rate limit, histórico salvo.
 */
export const POST = withAuth(
  { bodySchema: assistantChatSchema, rateLimit: { name: 'assistant', limit: 30, windowMs: 60_000 } },
  async ({ userId, body }) => {
    const message = body.message

    // Carrega ou cria conversa (validando posse — multi-tenant)
    let convId = body.conversationId ?? undefined
    if (convId) {
      const owns = await prisma.conversation.findFirst({
        where: { id: convId, userId, deletedAt: null },
        select: { id: true },
      })
      if (!owns) convId = undefined
    }
    if (!convId) {
      const created = await prisma.conversation.create({
        data: { userId, title: message.slice(0, 60) },
      })
      convId = created.id
    }

    await prisma.chatMessage.create({ data: { conversationId: convId, role: 'user', content: message } })

    try {
      const interpretation = await interpretQuery(message)
      const results =
        interpretation.intent === 'search_clients'
          ? await runClientQuery(prisma, userId, interpretation.filters)
          : []

      const answer = await answerQuestion(message, interpretation.humanInterpretation, results)
      const citations = results.slice(0, 10).map((r) => ({ id: r.id, name: r.name, reason: r.matchReason }))

      await prisma.chatMessage.create({
        data: {
          conversationId: convId,
          role: 'assistant',
          content: answer,
          citations: citations as unknown as Prisma.InputJsonValue,
        },
      })
      await prisma.conversation.update({ where: { id: convId }, data: { updatedAt: new Date() } })

      return apiSuccess({ conversationId: convId, answer, citations })
    } catch {
      const fallback = 'Tive um problema ao consultar sua base agora. Tente novamente em instantes.'
      await prisma.chatMessage.create({ data: { conversationId: convId, role: 'assistant', content: fallback } })
      return apiSuccess({ conversationId: convId, answer: fallback, citations: [] })
    }
  },
)
