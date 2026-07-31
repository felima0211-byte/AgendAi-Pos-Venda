import Groq, { toFile } from 'groq-sdk'

export interface TranscriptionResult {
  text: string
  language: string
  duration?: number
  model: string
}

const MAX_RETRIES = 3
const TIMEOUT_MS = 60_000 // 60s por tentativa
const RETRY_DELAYS = [1000, 2000, 4000] // exponential backoff

function log(level: 'info' | 'warn' | 'error', msg: string, meta?: object) {
  const entry = { ts: new Date().toISOString(), service: 'AudioTranscription', level, msg, ...meta }
  if (level === 'error') console.error(JSON.stringify(entry))
  else if (level === 'warn') console.warn(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function transcribeAudio(
  fileBuffer: Buffer,
  mimeType: string,
  filename: string,
  interactionId?: string
): Promise<TranscriptionResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY não configurada')

  const ext = mimeType.includes('mp4') ? 'mp4'
    : mimeType.includes('ogg') ? 'ogg'
    : mimeType.includes('wav') ? 'wav'
    : 'webm'
  const safeFilename = `${filename}.${ext}`

  log('info', 'Iniciando transcrição', {
    interactionId,
    mimeType,
    sizeBytes: fileBuffer.byteLength,
    filename: safeFilename,
  })

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = new Groq({ apiKey, timeout: TIMEOUT_MS })
      const file = await toFile(fileBuffer, safeFilename, { type: mimeType })

      const response = await client.audio.transcriptions.create({
        file,
        model: 'whisper-large-v3',
        language: 'pt',
        response_format: 'verbose_json',
        temperature: 0,
      })

      const result: TranscriptionResult = {
        text: response.text ?? '',
        language: (response as { language?: string }).language ?? 'pt',
        duration: (response as { duration?: number }).duration,
        model: 'whisper-large-v3',
      }

      log('info', 'Transcrição concluída', {
        interactionId,
        attempt,
        chars: result.text.length,
        duration: result.duration,
      })

      return result
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      log('warn', `Tentativa ${attempt}/${MAX_RETRIES} falhou`, {
        interactionId,
        attempt,
        error: lastError.message,
      })

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt - 1] ?? 4000
        log('info', `Aguardando ${delay}ms antes de tentar novamente`, { interactionId })
        await sleep(delay)
      }
    }
  }

  log('error', 'Transcrição falhou após todas as tentativas', {
    interactionId,
    error: lastError?.message,
  })

  throw lastError ?? new Error('Falha na transcrição')
}
