import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import type { ZodType } from 'zod'
import { apiError } from './response'
import {
  ApiException,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from './errors'
import { enforceRateLimit } from './rate-limit'
import { resolveDbUser } from '@/lib/auth/resolve-db-user'

/**
 * withAuth — invólucro único para rotas de API (Camadas 2 + 4).
 *
 * Garante, para TODA rota que o usa:
 *  - usuário autenticado (Clerk) + resolvido no banco (multi-tenant)
 *  - RBAC opcional por papel (preparado para expansão)
 *  - rate limit por usuário
 *  - validação/sanitização do corpo com Zod (Zero Trust: nunca confiar no front)
 *  - tratamento global de erros + respostas padronizadas + logs de exceção
 *
 * Princípios: Security by Default, Fail Fast, Fail Secure, DRY.
 */

export interface AuthContext<TBody, TParams> {
  req: NextRequest
  clerkId: string
  userId: string
  role: string
  body: TBody
  params: TParams
}

interface WithAuthOptions<TBody> {
  bodySchema?: ZodType<TBody>
  rateLimit?: { name: string; limit: number; windowMs: number }
  roles?: string[]
}

type RouteContext<TParams> = { params: Promise<TParams> } | undefined

function log(msg: string, meta: object) {
  console.error(JSON.stringify({ ts: new Date().toISOString(), scope: 'api', msg, ...meta }))
}

function handleApiError(err: unknown, req: NextRequest) {
  if (err instanceof ApiException) {
    // erros de domínio: mensagem segura para o cliente
    return apiError(err.message, err.status, err.code)
  }
  // erro inesperado: loga detalhe, devolve genérico (Fail Secure — não vaza interno)
  log('Erro não tratado', {
    path: req.nextUrl?.pathname,
    method: req.method,
    error: err instanceof Error ? err.message : String(err),
  })
  return apiError('Erro interno do servidor', 500, 'INTERNAL')
}

export function withAuth<TBody = undefined, TParams = Record<string, never>>(
  options: WithAuthOptions<TBody>,
  handler: (ctx: AuthContext<TBody, TParams>) => Promise<Response> | Response,
) {
  return async (req: NextRequest, routeCtx: RouteContext<TParams>): Promise<Response> => {
    try {
      // ── Camada 2: autenticação ──
      const { userId: clerkId } = await auth()
      if (!clerkId) throw new UnauthorizedError()

      // Resolve (ou cria Just-In-Time) o usuário multi-tenant no banco
      const dbUser = await resolveDbUser(clerkId)

      // ── RBAC (preparado para expansão) ──
      if (options.roles && !options.roles.includes(dbUser.role)) {
        throw new ForbiddenError()
      }

      // ── Rate limit por usuário ──
      if (options.rateLimit) {
        enforceRateLimit({
          key: `${dbUser.id}:${options.rateLimit.name}`,
          limit: options.rateLimit.limit,
          windowMs: options.rateLimit.windowMs,
        })
      }

      // ── Camada 4: validação do corpo (Zero Trust) ──
      let body = undefined as TBody
      if (options.bodySchema) {
        let json: unknown
        try {
          json = await req.json()
        } catch {
          throw new ValidationError('Corpo da requisição inválido (JSON malformado)')
        }
        const parsed = options.bodySchema.safeParse(json)
        if (!parsed.success) {
          const first = parsed.error.issues[0]
          throw new ValidationError(first ? `${first.path.join('.')}: ${first.message}` : 'Dados inválidos')
        }
        body = parsed.data
      }

      const params = (routeCtx ? await routeCtx.params : ({} as TParams)) as TParams

      return await handler({ req, clerkId, userId: dbUser.id, role: dbUser.role, body, params })
    } catch (err) {
      return handleApiError(err, req)
    }
  }
}
