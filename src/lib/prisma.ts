import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada')
  }

  // Remove sslmode da string (ele força verificação e sobrepõe a config ssl abaixo).
  // O pooler do Supabase usa cert AWS fora da cadeia do runtime serverless → rejectUnauthorized:false.
  // A conexão segue criptografada (SSL habilitado pela config ssl).
  const cleanConn = connectionString.replace(/([?&])sslmode=[^&]*/gi, '$1').replace(/[?&]+$/g, '')
  // max:1 — cada função serverless usa 1 conexão (o pooler de transação multiplexa).
  const adapter = new PrismaPg({ connectionString: cleanConn, ssl: { rejectUnauthorized: false }, max: 1 })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
