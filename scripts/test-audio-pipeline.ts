/**
 * Test script: testa upload → Supabase → Groq Whisper → DB
 * Uso: npm run test:audio
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import Groq, { toFile } from 'groq-sdk'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const dbUrl = process.env.DATABASE_URL
const prisma = dbUrl && !dbUrl.includes('johndoe')
  ? new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) })
  : null

// ── Gera um arquivo WAV mínimo válido (1 segundo de silêncio) ──────────────

function generateSilentWav(durationSeconds = 1, sampleRate = 16000): Buffer {
  const numSamples = durationSeconds * sampleRate
  const dataSize = numSamples * 2 // 16-bit PCM = 2 bytes por sample
  const headerSize = 44
  const totalSize = headerSize + dataSize

  const buf = Buffer.alloc(totalSize)

  // RIFF header
  buf.write('RIFF', 0)
  buf.writeUInt32LE(totalSize - 8, 4)
  buf.write('WAVE', 8)

  // fmt chunk
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)          // chunk size
  buf.writeUInt16LE(1, 20)           // PCM = 1
  buf.writeUInt16LE(1, 22)           // mono
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(sampleRate * 2, 28) // byte rate
  buf.writeUInt16LE(2, 32)           // block align
  buf.writeUInt16LE(16, 34)          // bits per sample

  // data chunk
  buf.write('data', 36)
  buf.writeUInt32LE(dataSize, 40)
  // samples = 0 (silence) — already zeroed by Buffer.alloc

  return buf
}

// ── Test 1: Supabase Storage upload ──────────────────────────────────────

async function testSupabaseUpload(wavBuffer: Buffer): Promise<string | null> {
  console.log('\n📦 TEST 1: Supabase Storage Upload')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key || url.includes('xxx')) {
    console.log('  ⚠️  SKIP — NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configurados')
    return null
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const hasBucket = buckets?.some((b) => b.name === 'audios')
    if (!hasBucket) {
      const { error: bucketErr } = await supabase.storage.createBucket('audios', { public: true })
      if (bucketErr) throw new Error(`Criar bucket: ${bucketErr.message}`)
      console.log('  ✅ Bucket "audios" criado')
    }

    const path = `test/test-audio-${Date.now()}.wav`
    const { error } = await supabase.storage.from('audios').upload(path, wavBuffer, {
      contentType: 'audio/wav',
      upsert: true,
    })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabase.storage.from('audios').getPublicUrl(path)
    console.log(`  ✅ Upload OK — URL: ${urlData.publicUrl}`)
    return urlData.publicUrl
  } catch (err) {
    console.log(`  ❌ FALHOU: ${err instanceof Error ? err.message : err}`)
    return null
  }
}

// ── Test 2: Groq Whisper Transcription ───────────────────────────────────

async function testGroqTranscription(wavBuffer: Buffer): Promise<string | null> {
  console.log('\n🎙️  TEST 2: Groq Whisper Transcription')

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey.includes('gsk_...')) {
    console.log('  ⚠️  SKIP — GROQ_API_KEY não configurada')
    return null
  }

  try {
    const client = new Groq({ apiKey })
    const file = await toFile(wavBuffer, 'test.wav', { type: 'audio/wav' })

    const response = await client.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      language: 'pt',
      response_format: 'verbose_json',
      temperature: 0,
    })

    const text = response.text ?? ''
    console.log(`  ✅ Whisper OK — Transcrição: "${text || '(silêncio detectado)'}"`)
    return text
  } catch (err) {
    console.log(`  ❌ FALHOU: ${err instanceof Error ? err.message : err}`)
    return null
  }
}

// ── Test 3: Database save ────────────────────────────────────────────────

async function testDatabaseSave(
  audioUrl: string | null,
  transcription: string | null
): Promise<boolean> {
  console.log('\n🗄️  TEST 3: Salvar no Banco de Dados (Prisma)')

  if (!prisma) {
    console.log('  ⚠️  SKIP — DATABASE_URL não configurada')
    return false
  }

  try {
    // Upsert test user
    const user = await prisma!.user.upsert({
      where: { clerkId: 'test_pipeline_user' },
      create: {
        clerkId: 'test_pipeline_user',
        name: 'Teste Pipeline',
        email: 'test-pipeline@agendai.local',
      },
      update: {},
    })

    // Create or reuse test client
    let client = await prisma!.client.findFirst({
      where: { userId: user.id, name: 'Cliente Teste Pipeline', deletedAt: null },
    })
    if (!client) {
      client = await prisma!.client.create({
        data: { userId: user.id, name: 'Cliente Teste Pipeline', status: 'ACTIVE' },
      })
    }

    // Create interaction + audio
    const interaction = await prisma!.interaction.create({
      data: {
        clientId: client.id,
        type: 'AUDIO_NOTE',
        notes: 'Registro de teste automatizado do pipeline de áudio',
        aiTranscription: transcription,
        aiKeywords: [],
        audio: audioUrl
          ? {
              create: {
                url: audioUrl,
                bucket: 'audios',
                path: `test/test-audio.wav`,
                fileSizeBytes: 32044,
                mimeType: 'audio/wav',
                durationSecs: 1,
                transcription,
                transcribedAt: transcription ? new Date() : null,
                whisperModel: transcription ? 'whisper-large-v3' : null,
              },
            }
          : undefined,
      },
      include: { audio: true },
    })

    // Timeline event
    await prisma!.timelineEvent.create({
      data: {
        clientId: client.id,
        type: 'INTERACTION_REGISTERED',
        title: '[TESTE] Atendimento registrado',
        body: transcription ?? 'Áudio de teste salvo.',
      },
    })

    console.log(`  ✅ DB OK — Interaction ID: ${interaction.id}`)
    console.log(`  ✅ Audio ID: ${interaction.audio?.id ?? 'sem arquivo (URL não disponível)'}`)
    console.log(`  ✅ Timeline event criado`)
    return true
  } catch (err) {
    console.log(`  ❌ FALHOU: ${err instanceof Error ? err.message : err}`)
    return false
  } finally {
    await prisma!.$disconnect()
  }
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60))
  console.log('🧪 AgendAI — Teste do Pipeline de Áudio')
  console.log('='.repeat(60))

  const wavBuffer = generateSilentWav(1)
  console.log(`\n✅ WAV gerado: ${wavBuffer.byteLength} bytes (1 segundo de silêncio, 16kHz mono)`)

  const [audioUrl, transcription] = await Promise.all([
    testSupabaseUpload(wavBuffer),
    testGroqTranscription(wavBuffer),
  ])

  const dbOk = await testDatabaseSave(audioUrl, transcription)

  console.log('\n' + '='.repeat(60))
  console.log('📊 RESULTADO:')
  console.log(`  Supabase Storage : ${audioUrl ? '✅ OK' : '⚠️  Pulado/Falhou'}`)
  console.log(`  Groq Whisper     : ${transcription !== null ? '✅ OK' : '⚠️  Pulado/Falhou'}`)
  console.log(`  Banco de Dados   : ${dbOk ? '✅ OK' : '⚠️  Pulado/Falhou'}`)
  console.log('='.repeat(60))

  if (!audioUrl && !transcription && !dbOk) {
    console.log('\n⚠️  Configure o .env com credenciais reais e rode novamente.')
    console.log('   Variáveis necessárias:')
    console.log('   DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL,')
    console.log('   SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY')
  } else {
    console.log('\n🎉 Pipeline parcialmente ou totalmente funcional!')
  }
}

main().catch((e) => {
  console.error('ERRO FATAL:', e)
  process.exit(1)
})
