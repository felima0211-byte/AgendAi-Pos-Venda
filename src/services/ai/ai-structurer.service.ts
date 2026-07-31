import Groq from 'groq-sdk'
import type { AiExtractedData } from '@/types/ai-extraction'

const MAX_RETRIES = 2
const RETRY_DELAYS = [1000, 2000]

function log(level: 'info' | 'warn' | 'error', msg: string, meta?: object) {
  console[level === 'info' ? 'log' : level](
    JSON.stringify({ ts: new Date().toISOString(), service: 'AiStructurer', level, msg, ...meta })
  )
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

const SYSTEM_PROMPT = `Você é um assistente especializado em extrair informações de atendimentos de vendas no varejo de moda infantil.

Analise a transcrição fornecida e extraia as informações em JSON.

REGRAS OBRIGATÓRIAS:
- Nunca invente informações que não estejam na transcrição
- Campos não mencionados devem ser null ou []
- Responda APENAS com o JSON, sem texto adicional
- O JSON deve seguir exatamente o schema fornecido

SCHEMA:
{
  "cliente": string | null,           // Nome do cliente/compradora
  "comprador": string | null,          // Quem está comprando (mãe, avó, etc)
  "telefone": string | null,           // Telefone mencionado
  "instagram": string | null,          // @ do instagram
  "idadeCrianca": string | null,       // Idade da criança
  "produtos": string[],                // Lista de produtos comprados/mencionados
  "quantidades": string[],             // Quantidades correspondentes
  "valorTotal": number | null,         // Valor final TOTAL da venda em reais (R$), só o número (ex.: "vendi por 150 reais" -> 150; "cento e cinquenta" -> 150). null se não mencionado
  "categorias": string[],              // Categorias (roupas, sapatos, etc)
  "ocasiao": string | null,            // Ocasião (aniversário, uso diário, etc)
  "observacoes": string | null,        // Observações gerais
  "produtosDesejados": string[],       // Produtos que a cliente quer mas não comprou
  "itensParaFuturaVenda": string[],    // Oportunidades de venda futura
  "possivelOportunidade": string | null, // Oportunidade identificada
  "resumo": string | null              // Resumo em 1-2 frases do atendimento
}`

/** Converte valor da IA (number, "150", "R$ 150,00", "1.250,50") em número em reais. */
function parseMoney(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? v : null
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
    const n = parseFloat(cleaned)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  return null
}

function validateAndParse(raw: string, interactionId?: string): AiExtractedData {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`JSON inválido retornado pela IA: ${raw.slice(0, 100)}`)
  }

  const obj = parsed as Record<string, unknown>

  // Garantir que arrays sejam arrays e strings sejam strings
  const safe: AiExtractedData = {
    cliente: typeof obj.cliente === 'string' ? obj.cliente : null,
    comprador: typeof obj.comprador === 'string' ? obj.comprador : null,
    telefone: typeof obj.telefone === 'string' ? obj.telefone : null,
    instagram: typeof obj.instagram === 'string' ? obj.instagram : null,
    idadeCrianca: typeof obj.idadeCrianca === 'string' ? obj.idadeCrianca : null,
    produtos: Array.isArray(obj.produtos) ? obj.produtos.map(String) : [],
    quantidades: Array.isArray(obj.quantidades) ? obj.quantidades.map(String) : [],
    valorTotal: parseMoney(obj.valorTotal),
    categorias: Array.isArray(obj.categorias) ? obj.categorias.map(String) : [],
    ocasiao: typeof obj.ocasiao === 'string' ? obj.ocasiao : null,
    observacoes: typeof obj.observacoes === 'string' ? obj.observacoes : null,
    produtosDesejados: Array.isArray(obj.produtosDesejados) ? obj.produtosDesejados.map(String) : [],
    itensParaFuturaVenda: Array.isArray(obj.itensParaFuturaVenda) ? obj.itensParaFuturaVenda.map(String) : [],
    possivelOportunidade: typeof obj.possivelOportunidade === 'string' ? obj.possivelOportunidade : null,
    resumo: typeof obj.resumo === 'string' ? obj.resumo : null,
  }

  log('info', 'JSON extraído e validado', { interactionId, cliente: safe.cliente, produtos: safe.produtos.length })
  return safe
}

export async function structureTranscription(
  transcription: string,
  interactionId?: string
): Promise<AiExtractedData> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY não configurada')

  log('info', 'Iniciando estruturação', { interactionId, transcriptionLength: transcription.length })

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const client = new Groq({ apiKey, timeout: 30_000 })

      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Transcrição do atendimento:\n\n"${transcription}"` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: 1024,
      })

      const raw = response.choices[0]?.message?.content ?? '{}'
      return validateAndParse(raw, interactionId)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      log('warn', `Tentativa ${attempt} falhou`, { interactionId, error: lastError.message })

      if (attempt <= MAX_RETRIES) {
        await sleep(RETRY_DELAYS[attempt - 1] ?? 2000)
      }
    }
  }

  log('error', 'Estruturação falhou após todas as tentativas', {
    interactionId,
    error: lastError?.message,
  })

  throw lastError ?? new Error('Falha na estruturação')
}
