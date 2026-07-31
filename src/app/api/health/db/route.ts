import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Health-check público e TEMPORÁRIO: confirma a conexão do banco a partir do runtime (Vercel).
export const dynamic = 'force-dynamic'

export async function GET() {
  const started = Date.now()
  try {
    const rows = await prisma.$queryRaw`select 1 as ok`
    const users = await prisma.user.count()
    return NextResponse.json({ ok: true, rows, users, ms: Date.now() - started })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), ms: Date.now() - started },
      { status: 500 },
    )
  }
}
