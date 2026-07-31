import Groq from 'groq-sdk'
import type { MessageContext, MessageType } from '@/types/message'
import { MESSAGE_TYPE_LABEL } from '@/types/message'

/**
 * ── Fatia 12 — Mensagens Inteligentes ──
 *
 * Gera uma mensagem de WhatsApp personalizada a partir do histórico REAL do
 * cliente. A mensagem deve parecer escrita pela própria vendedora — nunca
 * automática.
 */

const MAX_RETRIES = 2
const RETRY_DELAYS = [800, 1600]

function log(level: 'info' | 'warn' | 'error', msg: string, meta?: object) {
  console[level === 'info' ? 'log' : level](
    JSON.stringify({ ts: new Date().toISOString(), service: 'MessageGenerator', level, msg, ...meta }),
  )
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

const SYSTEM_PROMPT = `Você escreve mensagens de WhatsApp para uma vendedora autônoma de moda infantil enviar às suas clientes.

A mensagem deve parecer escrita pela PRÓPRIA vendedora, de forma pessoal e calorosa.

REGRAS OBRIGATÓRIAS:
- Curta (2 a 4 frases no máximo)
- Humanizada, elegante, amigável e natural
- NUNCA parecer automática ou robótica
- Sem linguagem comercial agressiva ("APROVEITE", "IMPERDÍVEL", "ÚLTIMAS UNIDADES")
- No máximo 1 emoji, e só se combinar naturalmente
- Use APENAS as informações reais fornecidas. Nunca invente produtos, datas ou fatos.
- Trate a cliente pelo primeiro nome
- Escreva em português do Brasil, tom de conversa de vendedora que conhece a cliente
- Responda SOMENTE com o texto da mensagem, sem aspas, sem título, sem explicação`

function intentFor(type: MessageType): string {
  switch (type) {
    case 'POST_SALE':
      return 'Fazer um pós-venda carinhoso: perguntar se o produto agradou e se serviu bem.'
    case 'THANK_YOU':
      return 'Agradecer a compra de forma sincera.'
    case 'REPURCHASE':
      return 'Convidar sutilmente para uma nova compra, com base no que ela já levou.'
    case 'REMINDER':
      return 'Retomar o contato de forma leve, mantendo o relacionamento.'
    case 'NEWS':
      return 'Contar que chegaram novidades que combinam com o gosto dela.'
    case 'HOLIDAY':
      return 'Enviar uma mensagem calorosa por uma data comemorativa.'
    case 'BIRTHDAY':
      return 'Parabenizar pelo aniversário de forma pessoal.'
    case 'WELCOME':
      return 'Dar as boas-vindas à cliente de forma acolhedora.'
    default:
      return 'Enviar uma mensagem pessoal e relevante à cliente.'
  }
}

function buildUserPrompt(type: MessageType, ctx: MessageContext): string {
  const linhas: string[] = []
  linhas.push(`Objetivo da mensagem: ${MESSAGE_TYPE_LABEL[type]} — ${intentFor(type)}`)
  linhas.push('')
  linhas.push('Dados reais da cliente:')
  linhas.push(`- Nome: ${ctx.clienteNome}`)
  if (ctx.comprador) linhas.push(`- Quem compra: ${ctx.comprador}`)
  if (ctx.idadeCrianca) linhas.push(`- Idade da criança: ${ctx.idadeCrianca}`)
  if (ctx.produtos.length) linhas.push(`- Últimos produtos: ${ctx.produtos.join(', ')}`)
  if (ctx.categorias.length) linhas.push(`- Categorias: ${ctx.categorias.join(', ')}`)
  if (ctx.tamanhoSugerido) linhas.push(`- Próximo tamanho sugerido: ${ctx.tamanhoSugerido}`)
  if (ctx.ultimaCompra) linhas.push(`- Última compra: ${ctx.ultimaCompra}`)
  if (ctx.diasSemComprar != null) linhas.push(`- Dias desde a última compra: ${ctx.diasSemComprar}`)
  if (ctx.observacoes) linhas.push(`- Observações: ${ctx.observacoes}`)
  linhas.push('')
  linhas.push('Escreva a mensagem agora.')
  return linhas.join('\n')
}

export async function generateMessage(
  type: MessageType,
  ctx: MessageContext,
): Promise<{ content: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY não configurada')

  const model = 'llama-3.3-70b-versatile'
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const client = new Groq({ apiKey, timeout: 30_000 })
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(type, ctx) },
        ],
        // um pouco de temperatura para soar natural e permitir "regenerar"
        temperature: 0.8,
        max_tokens: 300,
      })

      const content = (response.choices[0]?.message?.content ?? '').trim()
      if (!content) throw new Error('IA retornou mensagem vazia')

      log('info', 'Mensagem gerada', { type, cliente: ctx.clienteNome, chars: content.length })
      return { content, model }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      log('warn', `Tentativa ${attempt} falhou`, { error: lastError.message })
      if (attempt <= MAX_RETRIES) await sleep(RETRY_DELAYS[attempt - 1] ?? 1500)
    }
  }

  throw lastError ?? new Error('Falha ao gerar mensagem')
}
