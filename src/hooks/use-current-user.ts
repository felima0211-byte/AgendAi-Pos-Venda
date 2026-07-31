'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useCallback } from 'react'

export function useCurrentUser() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()

  const handleSignOut = useCallback(async () => {
    // Encerra a sessão no Clerk e redireciona para o painel de login.
    // redirectUrl garante limpeza completa da sessão antes de navegar (fail-secure).
    await signOut({ redirectUrl: '/sign-in' })
  }, [signOut])

  const displayName = user
    ? user.firstName ?? user.emailAddresses[0]?.emailAddress ?? 'Usuário'
    : null

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  return {
    user,
    isLoaded,
    isSignedIn,
    displayName,
    firstName: user?.firstName ?? null,
    avatarUrl: user?.imageUrl ?? null,
    email: user?.emailAddresses[0]?.emailAddress ?? null,
    clerkId: user?.id ?? null,
    greeting,
    signOut: handleSignOut,
  }
}
