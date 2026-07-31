import { z } from 'zod'

/**
 * Schemas de validação de entrada (Camada 4) + sanitização.
 * Zero Trust: toda entrada do frontend passa por aqui antes de tocar a regra.
 */

/** Remove caracteres de controle e espaços das pontas (anti-injeção de texto). */
export function sanitizeText(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim()
}

const trimmed = (max: number) =>
  z.string().transform(sanitizeText).pipe(z.string().min(1).max(max))

const optionalTrimmed = (max: number) =>
  z
    .string()
    .transform((v) => sanitizeText(v))
    .pipe(z.string().max(max))
    .optional()
    .nullable()

// ── IA ──
export const smartSearchSchema = z.object({
  query: trimmed(500),
})

export const assistantChatSchema = z.object({
  message: trimmed(1000),
  conversationId: z.string().cuid().optional().nullable(),
})

export const textAtendimentoSchema = z.object({
  clientId: z.string().cuid().optional().nullable(),
  text: trimmed(4000),
})

export const generateMessageSchema = z.object({
  clientId: z.string().cuid(),
  type: z.enum([
    'POST_SALE', 'THANK_YOU', 'REPURCHASE', 'REMINDER',
    'NEWS', 'HOLIDAY', 'BIRTHDAY', 'WELCOME', 'CUSTOM',
  ]),
  reminderId: z.string().cuid().optional().nullable(),
})

// ── Clientes ──
export const createClientSchema = z.object({
  name: trimmed(120),
  phone: optionalTrimmed(30),
  email: z.string().email().max(160).optional().nullable().or(z.literal('')),
  address: optionalTrimmed(200),
  city: optionalTrimmed(80),
  birthDate: z.string().datetime().optional().nullable().or(z.literal('')),
  notes: optionalTrimmed(2000),
  tags: z.array(z.string().max(40)).max(20).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT', 'VIP']).optional(),
})

export const updateClientSchema = z.object({
  name: optionalTrimmed(120),
  phone: optionalTrimmed(30),
  email: z.string().email().max(160).optional().nullable().or(z.literal('')),
  address: optionalTrimmed(200),
  city: optionalTrimmed(80),
  birthDate: z.string().optional().nullable().or(z.literal('')),
  notes: optionalTrimmed(2000),
  tags: z.array(z.string().max(40)).max(20).optional(),
  clientStatus: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT', 'VIP']).optional(),
})

// ── Lembretes ──
export const createReminderSchema = z.object({
  clientId: z.string().cuid(),
  title: trimmed(160),
  body: optionalTrimmed(1000),
  dueAt: z.string().datetime().or(z.string().min(1)),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

export const reminderActionSchema = z.object({
  action: z.enum(['complete', 'snooze', 'cancel', 'reopen', 'edit']),
  days: z.number().int().min(1).max(365).optional(),
  title: optionalTrimmed(160),
  body: optionalTrimmed(1000),
  dueAt: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

export const generateScheduleSchema = z.object({
  interactionId: z.string().cuid(),
})
