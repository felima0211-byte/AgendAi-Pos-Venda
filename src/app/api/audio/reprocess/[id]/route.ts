import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import { transcribeAudio } from '@/services/audio/audio-transcription.service'
import { structureTranscription } from '@/services/ai/ai-structurer.service'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id: audioId } = await params
  const dbUser = await resolveDbUser(clerkId)
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const audio = await prisma.audio.findFirst({
    where: { id: audioId },
    include: { interaction: { include: { client: true } } },
  })

  if (!audio) return NextResponse.json({ error: 'Áudio não encontrado' }, { status: 404 })
  if (audio.interaction.client.userId !== dbUser.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  await prisma.audio.update({ where: { id: audioId }, data: { status: 'PROCESSING', transcriptionError: null } })

  try {
    // Baixar arquivo do Supabase Storage
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data, error } = await supabase.storage.from(audio.bucket).download(audio.path)
    if (error || !data) throw new Error(`Erro ao baixar áudio: ${error?.message}`)

    const buffer = Buffer.from(await data.arrayBuffer())

    // Retranscrever
    const transcription = await transcribeAudio(buffer, audio.mimeType, 'audio', audio.interactionId)

    await prisma.audio.update({
      where: { id: audioId },
      data: {
        transcription: transcription.text,
        transcribedAt: new Date(),
        durationSecs: transcription.duration ? Math.round(transcription.duration) : null,
        status: 'COMPLETED',
        transcriptionError: null,
      },
    })

    await prisma.interaction.update({
      where: { id: audio.interactionId },
      data: { aiTranscription: transcription.text },
    })

    // Reestruturar
    let extractedData = null
    if (transcription.text.trim().length > 10) {
      extractedData = await structureTranscription(transcription.text, audio.interactionId)
      await prisma.interaction.update({
        where: { id: audio.interactionId },
        data: {
          aiExtractedData: extractedData as object,
          aiProcessedAt: new Date(),
          aiSummary: extractedData.resumo,
        },
      })
    }

    return NextResponse.json({ success: true, transcription: transcription.text, extractedData })
  } catch (err) {
    await prisma.audio.update({
      where: { id: audioId },
      data: { status: 'ERROR', transcriptionError: err instanceof Error ? err.message : 'Erro' },
    })
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 })
  }
}
