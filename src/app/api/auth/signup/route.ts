import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/auth/signup  { email, password, name }
 * Cria a conta já com e-mail confirmado (sem fricção). O login em si é feito
 * no cliente com signInWithPassword (grava a sessão no cookie do próprio domínio).
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  const name = body.name?.trim() || null

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 422 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'A senha precisa de ao menos 8 caracteres' }, { status: 422 })
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
      : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
