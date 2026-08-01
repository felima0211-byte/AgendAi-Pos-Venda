import { createClient } from '@/lib/supabase/server'

/**
 * Shim de autenticação (substitui o `auth()` do Clerk).
 * Retorna o id do usuário autenticado do Supabase, ou null.
 */
export async function auth() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return { userId: data.user?.id ?? null }
}

/** Shim de `currentUser()` — formato mínimo compatível com o uso em resolveDbUser. */
export async function currentUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const u = data.user
  if (!u) return null
  const meta = (u.user_metadata ?? {}) as Record<string, string>
  const fullName = meta.full_name ?? meta.name ?? ''
  return {
    id: u.id,
    primaryEmailAddressId: 'primary',
    emailAddresses: [{ id: 'primary', emailAddress: u.email ?? '' }],
    firstName: meta.first_name ?? (fullName ? fullName.split(' ')[0] : null),
    lastName: meta.last_name ?? (fullName ? fullName.split(' ').slice(1).join(' ') || null : null),
    imageUrl: meta.avatar_url ?? null,
    phoneNumbers: u.phone ? [{ phoneNumber: u.phone }] : [],
    username: null as string | null,
  }
}
