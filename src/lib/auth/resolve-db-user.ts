import { currentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'

export interface DbUserLite {
  id: string
  role: string
}

/**
 * Resolve o usuário do banco a partir do clerkId, criando-o Just-In-Time
 * se ainda não existir (fallback ao webhook do Clerk, que não chega em dev local).
 *
 * Garante que todo usuário autenticado no Clerk tenha uma linha em `users`,
 * eliminando o erro "Usuário não encontrado" no primeiro atendimento.
 */
export async function resolveDbUser(clerkId: string): Promise<DbUserLite> {
  const existing = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  })
  if (existing) return existing

  // JIT: monta o usuário com os dados do Clerk
  const cu = await currentUser()
  const email =
    cu?.emailAddresses.find((e) => e.id === cu.primaryEmailAddressId)?.emailAddress ??
    cu?.emailAddresses[0]?.emailAddress ??
    `${clerkId}@agendai.app`
  const name =
    [cu?.firstName, cu?.lastName].filter(Boolean).join(' ') ||
    cu?.username ||
    'Usuário'

  // Já existe linha com este e-mail (ex.: migração Clerk→Supabase)? Migra o id de auth
  // em vez de tentar inserir (evita violar o unique de email → 500).
  const byEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { clerkId, ...(cu?.imageUrl ? { avatarUrl: cu.imageUrl } : {}) },
      select: { id: true, role: true },
    })
  }

  return prisma.user.create({
    data: {
      clerkId,
      name,
      email,
      avatarUrl: cu?.imageUrl ?? null,
      phone: cu?.phoneNumbers?.[0]?.phoneNumber ?? null,
    },
    select: { id: true, role: true },
  })
}
