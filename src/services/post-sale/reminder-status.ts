import type { ReminderStatus } from '@prisma/client'

/**
 * Status "de exibição" derivado — o banco guarda o status real
 * (PENDING/COMPLETED/CANCELLED/SNOOZED), mas a UI precisa saber se um
 * lembrete pendente está para HOJE, ATRASADO ou ainda por vir.
 */
export type DisplayStatus = 'today' | 'overdue' | 'upcoming' | 'done' | 'cancelled'

export function deriveDisplayStatus(
  status: ReminderStatus,
  dueAt: Date | string,
  now: Date = new Date(),
): DisplayStatus {
  if (status === 'COMPLETED') return 'done'
  if (status === 'CANCELLED') return 'cancelled'

  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  if (due < startOfToday) return 'overdue'
  if (due <= endOfToday) return 'today'
  return 'upcoming'
}

export const DISPLAY_STATUS_LABEL: Record<DisplayStatus, string> = {
  today: 'Hoje',
  overdue: 'Atrasado',
  upcoming: 'Próximo',
  done: 'Concluído',
  cancelled: 'Cancelado',
}
