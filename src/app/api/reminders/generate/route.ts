import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import type { AiExtractedData } from '@/types/ai-extraction'
import {
  createPostSaleSchedule,
  cancelStaleWinbacks,
  toPurchaseContext,
} from '@/services/post-sale/post-sale-engine.service'

/**
 * POST /api/reminders/generate  { interactionId }
 * Gera o cronograma de pós-venda a partir de um atendimento já processado
 * pela IA. Idempotente. Útil para atendimentos antigos ou reprocessados.
 */
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { interactionId } = await req.json()
  if (!interactionId) return NextResponse.json({ error: 'interactionId obrigatório' }, { status: 400 })

  const interaction = await prisma.interaction.findFirst({
    where: { id: interactionId, deletedAt: null, client: { userId: dbUser.id } },
    include: { client: { select: { id: true } } },
  })
  if (!interaction) return NextResponse.json({ error: 'Atendimento não encontrado' }, { status: 404 })

  const extracted = interaction.aiExtractedData as unknown as AiExtractedData | null
  if (!extracted || !extracted.produtos?.length) {
    return NextResponse.json(
      { error: 'Atendimento sem produtos — nada a agendar', created: 0 },
      { status: 422 },
    )
  }

  const context = toPurchaseContext(extracted)

  const result = await createPostSaleSchedule({
    prisma,
    clientId: interaction.clientId,
    interactionId: interaction.id,
    context,
  })

  // nova compra → cancela winbacks pendentes do histórico anterior
  await cancelStaleWinbacks({
    prisma,
    clientId: interaction.clientId,
    keepInteractionId: interaction.id,
  })

  if (!result.skipped) {
    await prisma.timelineEvent.create({
      data: {
        clientId: interaction.clientId,
        type: 'AI_INSIGHT',
        title: 'Pós-venda agendado',
        body: `${result.created} lembretes de acompanhamento criados automaticamente.`,
        aiGenerated: true,
      },
    })
  }

  return NextResponse.json(result)
}
