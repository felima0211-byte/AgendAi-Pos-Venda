'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useCurrentUser() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setIsLoaded(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSignOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }, [router])

  const meta = (user?.user_metadata ?? {}) as Record<string, string>
  const fullName = meta.full_name ?? meta.name ?? ''
  const firstName = meta.first_name ?? (fullName ? fullName.split(' ')[0] : null)
  const email = user?.email ?? null
  const displayName = fullName || firstName || email || (user ? 'Usuário' : null)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
    displayName,
    firstName,
    avatarUrl: meta.avatar_url ?? null,
    email,
    userId: user?.id ?? null,
    greeting,
    signOut: handleSignOut,
  }
}
