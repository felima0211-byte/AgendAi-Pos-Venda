import { RateLimitError } from './errors'

/**
 * Rate limit por usuário (Camada 4 — Least Privilege / Zero Trust).
 *
 * Implementação em memória (janela deslizante simples). Suficiente para uma
 * instância; em produção multi-instância, trocar por Redis/Upstash mantendo
 * esta mesma interface `enforceRateLimit`.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// limpeza periódica para não crescer indefinidamente
let lastSweep = Date.now()
function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key)
  }
}

export interface RateLimitOptions {
  /** identificador (ex: `${userId}:${routeName}`) */
  key: string
  /** máximo de requisições na janela */
  limit: number
  /** janela em milissegundos */
  windowMs: number
}

export function enforceRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (bucket.count >= limit) {
    throw new RateLimitError()
  }
  bucket.count++
}
