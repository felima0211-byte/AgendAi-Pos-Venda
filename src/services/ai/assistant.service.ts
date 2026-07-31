import Groq from 'groq-sdk'
import type { ClientResult } from './client-query.service'

/**
 * ── Fatia 14 — Assistente IA Conversacional ──
 *
 * Recebe os clientes REAIS encontrados pela consulta e redige uma resposta
 * natural, citando os dados. Regra dura: só fala do que foi passado; se a lista
 * veio vazia, diz isso claramente. Nunca usa conhecimento externo.
 */

function log(level: 'info' | 'warn' | 'error', msg: string, meta?: object) {
  console[level === 'info' ? 'log' : level](
    JSON.stringify({ ts: new Date().toISOString(), service: 'Assistant', level, msg, ...meta }),
  )
}

const SYSTEM_PROMPT = `Você é o assistente de vendas de uma vendedora autônoma de moda infantil.

Você SÓ pode usar os dados fornecidos no contexto (clientes reais encontrados no banco).
NUNCA invente clientes, números ou fatos. NUNCA use conhecimento externo.

REGRAS:
- Responda em português do Brasil, tom de consultora prática e amigável
- Seja direto e curto (até ~5 linhas)
- Cite os nomes dos clientes reais e o motivo de aparecerem
- Se a lista de clientes estiver vazia, diga com clareza que não há registros para isso
- Se fizer sentido, sugira uma próxima ação (ex: "vale mandar um pós-venda")
- Não prometa nada que não esteja nos dados`

export async function answerQuestion(
  question: string,
  interpretation: string,
  results: ClientResult[],
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY não configurada')

  const contexto = results.length
    ? results
        .slice(0, 30)
        .map(
          (r, i) =>
            `${i + 1}. ${r.name}${r.daysSincePurchase != null ? ` — ${r.daysSincePurchase} dias sem comprar` : ''} — ${r.salesCount} venda(s) — ${r.matchReason}`,
        )
        .join('\n')
    : '(nenhum cliente encontrado para esta busca)'

  const userPrompt = `Pergunta da vendedora: "${question}"

Interpretação da busca: ${interpretation}

Clientes reais encontrados (${results.length}):
${contexto}

Escreva a resposta agora, usando apenas esses dados.`

  const client = new Groq({ apiKey, timeout: 30_000 })
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 400,
  })

  const answer = (response.choices[0]?.message?.content ?? '').trim()
  log('info', 'Resposta gerada', { encontrados: results.length, chars: answer.length })
  return answer || 'Não encontrei registros para essa pergunta na sua base.'
}
