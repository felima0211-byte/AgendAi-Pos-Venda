import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Rate limit simples por IP para evitar account creation spray
const ipBuckets = new Map<string, { count: number; resetAt: number }>()
function checkSignupRateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = ipBuckets.get(ip)
  if (!bucket || bucket.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (bucket.count >= 5) return false
  bucket.count++
  return true
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

/**
 * POST /api/auth/signup  { email, password, name }
 * Cria a conta já com e-mail confirmado (sem fricção). O login em si é feito
 * no cliente com signInWithPassword (grava a sessão no cookie do próprio domínio).
 */
export async function POST(req: NextRequest) {
  // Rate limit por IP: máx 5 cadastros/minuto
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkSignupRateLimit(ip)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um minuto.' }, { status: 429 })
  }

  let body: { email?: string; password?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  const name = body.name?.trim().slice(0, 100) || null

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 422 })
  }
  if (!PASSWORD_REGEX.test(password)) {
    return NextResponse.json(
      { error: 'A senha precisa de ao menos 8 caracteres, uma letra maiúscula, uma minúscula e um número.' },
      { status: 422 },
    )
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { full_name: name } : undefined,
  })

  if (error) {
    const msg = /already|exist|registered/i.test(error.message)
      ? 'Este e-mail já está cadastrado.'
      : 'Não foi possível criar a conta. Tente novamente.'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
