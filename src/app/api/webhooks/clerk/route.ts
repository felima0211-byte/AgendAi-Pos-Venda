import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

type ClerkUserEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted'
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    first_name: string | null
    last_name: string | null
    image_url: string | null
    phone_numbers: { phone_number: string }[]
    primary_email_address_id: string
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()

  let event: ClerkUserEvent
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const { type, data } = event

  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address

  if (type === 'user.created' || type === 'user.updated') {
    await prisma.user.upsert({
      where: { clerkId: data.id },
      create: {
        clerkId: data.id,
        name: [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Usuário',
        email: primaryEmail ?? `${data.id}@agendai.app`,
        avatarUrl: data.image_url,
        phone: data.phone_numbers[0]?.phone_number ?? null,
      },
      update: {
        name: [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Usuário',
        email: primaryEmail ?? `${data.id}@agendai.app`,
        avatarUrl: data.image_url,
        phone: data.phone_numbers[0]?.phone_number ?? null,
      },
    })
  }

  if (type === 'user.deleted') {
    await prisma.user.update({
      where: { clerkId: data.id },
      data: { deletedAt: new Date() },
    })
  }

  return NextResponse.json({ received: true })
}
