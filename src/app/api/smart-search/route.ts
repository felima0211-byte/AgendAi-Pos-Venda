import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { smartSearchSchema } from '@/lib/api/schemas'
import { interpretQuery, runClientQuery } from '@/services/ai/client-query.service'

/**
 * POST /api/smart-search  { query }
 * Busca por linguagem natural. Sempre com dados reais — nunca inventa.
 * Camadas 2+4: auth, validação Zod, rate limit por usuário, erros padronizados.
 */
export const POST = withAuth(
  { bodySchema: smartSearchSchema, rateLimit: { name: 'smart-search', limit: 20, windowMs: 60_000 } },
  async ({ userId, body }) => {
    const interpretation = await interpretQuery(body.query)

    if (interpretation.intent !== 'search_clients') {
      return apiSuccess({
        interpretation:
          'Não consegui transformar isso em uma busca de clientes. Tente algo como "quem comprou manta" ou "quem está há mais de 60 dias sem comprar".',
        results: [],
        count: 0,
      })
    }

    const results = await runClientQuery(prisma, userId, interpretation.filters)
    return apiSuccess({ interpretation: interpretation.humanInterpretation, results, count: results.length })
  },
)
