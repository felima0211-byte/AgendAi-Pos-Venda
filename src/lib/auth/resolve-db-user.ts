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

  const user = await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      name,
      email,
      avatarUrl: cu?.imageUrl ?? null,
      phone: cu?.phoneNumbers?.[0]?.phoneNumber ?? null,
    },
    update: {},
    select: { id: true, role: true },
  })
  return user
}
