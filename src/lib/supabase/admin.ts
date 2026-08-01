import { createClient } from '@supabase/supabase-js'

/** Cliente admin (service role) — apenas server. Usado no cadastro para já confirmar o e-mail. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
