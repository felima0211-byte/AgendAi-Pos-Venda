import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'
import { registerSaleFromExtraction } from '@/services/sales/register-sale.service'
import { uploadAudioToStorage } from '@/services/audio/audio-upload.service'
import { transcribeAudio } from '@/services/audio/audio-transcription.service'
import { structureTranscription } from '@/services/ai/ai-structurer.service'
import {
  createPostSaleSchedule,
  cancelStaleWinbacks,
  toPurchaseContext,
} from '@/services/post-sale/post-sale-engine.service'

const MAX_SIZE_BYTES = 25 * 1024 * 1024   // 25MB (Groq limit)
const MAX_DURATION_SECS = 300              // 5 minutos
const ALLOWED_TYPES = [
  'audio/webm', 'audio/mp4', 'audio/ogg',
  'audio/mpeg', 'audio/wav', 'audio/x-wav',
  'audio/aac', 'audio/m4a', 'audio/x-m4a',
]

function log(level: 'info' | 'warn' | 'error', msg: string, meta?: object) {
  console[level === 'info' ? 'log' : level](
    JSON.stringify({ ts: new Date().toISOString(), route: 'POST /api/audio/upload', level, msg, ...meta })
  )
}

function isAllowedType(mime: string) {
  return ALLOWED_TYPES.some((t) => mime.startsWith(t.split(';')[0]))
}

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const dbUser = await resolveDbUser(clerkId)

  // ── Parse FormData ─────────────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 })
  }

  const file = formData.get('audio') as File | null
  const clientId = formData.get('clientId') as string | null
  const saleId = formData.get('saleId') as string | null
  const notes = formData.get('notes') as string | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'Arquivo de áudio ausente' }, { status: 400 })
  }

  // ── Validações ─────────────────────────────────────────────────────────────
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: `Áudio muito grande. Máximo ${MAX_SIZE_BYTES / 1024 / 1024}MB (≈ ${MAX_DURATION_SECS / 60} minutos)` }, { status: 413 })
  }

  const mimeType = file.type || 'audio/webm'
  if (!isAllowedType(mimeType)) {
    log('warn', 'MIME type rejeitado', { mimeType, userId: dbUser.id })
    return NextResponse.json({ error: `Formato não suportado: ${mimeType}` }, { status: 415 })
  }

  // ── Validar clientId pertence ao usuário ───────────────────────────────────
  let resolvedClientId = clientId
  let clientAutoCreated = false
  if (clientId) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: dbUser.id, deletedAt: null },
    })
    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }
  } else {
    // Cliente ainda sem nome — a IA preenche com o nome falado no áudio
    resolvedClientId = await getOrCreateAvulsoClient(dbUser.id)
    clientAutoCreated = true
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  log('info', 'Iniciando pipeline de áudio', {
    userId: dbUser.id,
    clientId: resolvedClientId,
    sizeBytes: buffer.byteLength,
    mimeType,
  })

  // ── Criar registro inicial (UPLOADING) ─────────────────────────────────────
  const interaction = await prisma.interaction.create({
    data: {
      clientId: resolvedClientId!,
      saleId: saleId ?? null,
      type: 'AUDIO_NOTE',
      notes: notes ?? null,
      aiKeywords: [],
      audio: {
        create: {
          status: 'UPLOADING',
          url: '',
          bucket: 'audios',
          path: '',
          fileSizeBytes: buffer.byteLength,
          mimeType,
        },
      },
    },
    include: { audio: true },
  })

  const audioId = interaction.audio!.id

  try {
    // ── 1. Upload Supabase Storage ─────────────────────────────────────────
    await prisma.audio.update({ where: { id: audioId }, data: { status: 'UPLOADING' } })

    const uploadResult = await uploadAudioToStorage(buffer, mimeType, dbUser.id, resolvedClientId ?? undefined)

    await prisma.audio.update({
      where: { id: audioId },
      data: { url: uploadResult.url, path: uploadResult.path, status: 'PROCESSING' },
    })

    log('info', 'Upload concluído', { audioId, url: uploadResult.url })

    // ── 2. Groq Whisper ────────────────────────────────────────────────────
    let transcriptionText: string | null = null
    let transcriptionError: string | null = null
    let durationSecs: number | null = null

    try {
      const transcription = await transcribeAudio(buffer, mimeType, 'audio', interaction.id)
      transcriptionText = transcription.text
      durationSecs = transcription.duration ? Math.round(transcription.duration) : null

      await prisma.audio.update({
        where: { id: audioId },
        data: {
          transcription: transcriptionText,
          transcribedAt: new Date(),
          whisperModel: 'whisper-large-v3',
          durationSecs,
        },
      })

      await prisma.interaction.update({
        where: { id: interaction.id },
        data: { aiTranscription: transcriptionText },
      })
    } catch (err) {
      transcriptionError = err instanceof Error ? err.message : 'Erro na transcrição'
      log('error', 'Whisper falhou', { audioId, error: transcriptionError })
      await prisma.audio.update({
        where: { id: audioId },
        data: { transcriptionError, status: 'ERROR' },
      })
    }

    // ── 3. IA Estruturadora (Fatia 08) ─────────────────────────────────────
    let extractedData = null
    if (transcriptionText && transcriptionText.trim().length > 10) {
      try {
        extractedData = await structureTranscription(transcriptionText, interaction.id)

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

        // Criar/atualizar cliente com dados extraídos.
        // Cliente auto-criado (sem nome) recebe o nome falado no áudio.
        if (resolvedClientId && extractedData.cliente) {
          await prisma.client.update({
            where: { id: resolvedClientId },
            data: {
              ...(clientAutoCreated && { name: extractedData.cliente }),
              ...(extractedData.telefone && { phone: extractedData.telefone }),
              aiSummary: extractedData.resumo,
              aiKeywords: extractedData.categorias ?? [],
              lastAiSync: new Date(),
            },
          })
        }

        log('info', 'IA estruturadora concluída', {
          interactionId: interaction.id,
          cliente: extractedData.cliente,
          produtos: extractedData.produtos.length,
        })
      } catch (err) {
        log('warn', 'IA estruturadora falhou (áudio salvo)', {
          interactionId: interaction.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    // ── 3.5 Motor de Pós-Venda (Fatia 11) ──────────────────────────────────
    // Se houve compra (produtos), agenda o cronograma de acompanhamento.
    // Guardado: falha aqui nunca perde o atendimento.
    let remindersCreated = 0
    if (resolvedClientId && extractedData && extractedData.produtos?.length) {
      try {
        const context = toPurchaseContext(extractedData)
        const result = await createPostSaleSchedule({
          prisma,
          clientId: resolvedClientId,
          interactionId: interaction.id,
          context,
        })
        remindersCreated = result.created

        // nova compra → cancela winbacks pendentes de atendimentos anteriores
        await cancelStaleWinbacks({
          prisma,
          clientId: resolvedClientId,
          keepInteractionId: interaction.id,
        })

        if (result.created > 0) {
          await prisma.timelineEvent.create({
            data: {
              clientId: resolvedClientId,
              type: 'AI_INSIGHT',
              title: 'Pós-venda agendado',
              body: `${result.created} lembretes de acompanhamento criados automaticamente.`,
              aiGenerated: true,
            },
          })
        }
      } catch (err) {
        log('warn', 'Motor de pós-venda falhou (atendimento salvo)', {
          interactionId: interaction.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    // ── 3.6 Registrar venda ────────────────────────────────────────────────
    // Todo áudio de atendimento gera uma nova venda + itens vendidos (produto + quantidade).
    let saleCreated = false
    let itemsCreated = 0
    if (resolvedClientId && !saleId) {
      try {
        const sale = await registerSaleFromExtraction(prisma, {
          userId: dbUser.id,
          clientId: resolvedClientId,
          extracted: extractedData,
          fallbackNote: transcriptionText,
        })
        await prisma.interaction.update({ where: { id: interaction.id }, data: { saleId: sale.saleId } })
        saleCreated = true
        itemsCreated = sale.itemsCreated
      } catch (err) {
        log('warn', 'Falha ao registrar venda (atendimento salvo)', {
          interactionId: interaction.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    // ── 4. Finalizar status ────────────────────────────────────────────────
    const finalStatus = transcriptionText ? 'COMPLETED' : 'ERROR'
    await prisma.audio.update({ where: { id: audioId }, data: { status: finalStatus } })

    // ── 5. Timeline event ──────────────────────────────────────────────────
    await prisma.timelineEvent.create({
      data: {
        clientId: resolvedClientId!,
        type: 'INTERACTION_REGISTERED',
        title: extractedData?.cliente ? `Atendimento — ${extractedData.cliente}` : 'Atendimento registrado',
        body: extractedData?.resumo
          ?? (transcriptionText ? `"${transcriptionText.slice(0, 120)}${transcriptionText.length > 120 ? '…' : ''}"` : 'Áudio registrado.'),
        aiGenerated: !!extractedData,
        aiInsight: extractedData?.possivelOportunidade ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      interactionId: interaction.id,
      audioId,
      audioUrl: uploadResult.url,
      transcription: transcriptionText,
      hasTranscription: !!transcriptionText,
      transcriptionError,
      extractedData,
      durationSecs,
      remindersCreated,
      saleCreated,
      itemsCreated,
    })
  } catch (err) {
    // Nunca perder a gravação — marca erro mas mantém o registro
    log('error', 'Erro crítico no pipeline', {
      audioId,
      error: err instanceof Error ? err.message : String(err),
    })

    await prisma.audio.update({
      where: { id: audioId },
      data: { status: 'ERROR', transcriptionError: err instanceof Error ? err.message : 'Erro interno' },
    }).catch(() => null)

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

async function getOrCreateAvulsoClient(userId: string): Promise<string> {
  const existing = await prisma.client.findFirst({
    where: { userId, name: 'Atendimento Avulso', deletedAt: null },
  })
  if (existing) return existing.id
  const created = await prisma.client.create({
    data: { userId, name: 'Atendimento Avulso', status: 'ACTIVE' },
  })
  return created.id
}
