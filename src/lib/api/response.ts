import { NextResponse } from 'next/server'

/**
 * Respostas padronizadas de API (Camada 4).
 * Todas as rotas devem responder neste formato: { ok, data } ou { ok, error }.
 */

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status })
}

export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json({ ok: false, error: { message, code } }, { status })
}
