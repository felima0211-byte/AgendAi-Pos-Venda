import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { faker } from '@faker-js/faker/locale/pt_BR'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function randomEnum<T extends Record<string, string>>(e: T): T[keyof T] {
  const values = Object.values(e) as T[keyof T][]
  return values[Math.floor(Math.random() * values.length)]
}

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

function daysAgo(days: number): Date {
  return daysFromNow(-days)
}

// ─────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpa tudo na ordem correta
  await prisma.timelineEvent.deleteMany()
  await prisma.audio.deleteMany()
  await prisma.interaction.deleteMany()
  await prisma.reminder.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.child.deleteMany()
  await prisma.product.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()

  // ── USER ──────────────────────────────────
  const user = await prisma.user.create({
    data: {
      clerkId: 'user_dev_felipe_2024',
      name: 'Felipe Lima',
      email: 'felima0211@gmail.com',
      phone: '11999990000',
      role: 'SELLER',
    },
  })
  console.log(`✅ Usuário criado: ${user.name}`)

  // ── PRODUCTS ──────────────────────────────
  const productData = [
    { name: 'Vestido Floral Verão', category: 'CLOTHING' as const, price: 189.9 },
    { name: 'Calça Jeans Skinny', category: 'CLOTHING' as const, price: 149.9 },
    { name: 'Blusa de Tricô', category: 'CLOTHING' as const, price: 99.9 },
    { name: 'Tênis Casual Feminino', category: 'SHOES' as const, price: 249.9 },
    { name: 'Sandália Plataforma', category: 'SHOES' as const, price: 179.9 },
    { name: 'Bolsa de Couro Sintético', category: 'BAGS' as const, price: 219.9 },
    { name: 'Conjunto Moletom', category: 'CLOTHING' as const, price: 169.9 },
    { name: 'Colar Dourado', category: 'JEWELRY' as const, price: 59.9 },
    { name: 'Brinco de Pérola', category: 'JEWELRY' as const, price: 49.9 },
    { name: 'Lenço de Seda', category: 'ACCESSORIES' as const, price: 79.9 },
  ]

  const products = await Promise.all(
    productData.map((p) =>
      prisma.product.create({
        data: {
          userId: user.id,
          name: p.name,
          category: p.category,
          price: p.price,
          description: faker.commerce.productDescription(),
          isActive: true,
        },
      })
    )
  )
  console.log(`✅ ${products.length} produtos criados`)

  // ── CLIENTS ───────────────────────────────
  const clientStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'VIP', 'PROSPECT', 'INACTIVE'] as const
  const clients = []

  for (let i = 0; i < 8; i++) {
    const status = clientStatuses[i % clientStatuses.length]
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name: faker.person.fullName({ sex: 'female' }),
        phone: `(${faker.number.int({ min: 11, max: 99 })}) 9${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        birthDate: faker.date.birthdate({ min: 18, max: 55, mode: 'age' }),
        notes: faker.lorem.sentence(),
        tags: faker.helpers.arrayElements(
          ['fiel', 'vip', 'pagamento-rápido', 'indicação', 'moda-festa', 'casual'],
          faker.number.int({ min: 1, max: 3 })
        ),
        status,
        aiSummary: `Cliente ${status === 'VIP' ? 'VIP com alto ticket médio' : 'ativa com compras regulares'}. Prefere ${faker.helpers.arrayElement(['roupas casuais', 'moda festa', 'looks do dia a dia'])}.`,
        aiKeywords: faker.helpers.arrayElements(
          ['fiel', 'pontual', 'alta-frequencia', 'ticket-alto', 'indica-amigas'],
          2
        ),
      },
    })

    // Children (50% dos clientes têm filhos)
    if (Math.random() > 0.5) {
      await prisma.child.createMany({
        data: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => ({
          clientId: client.id,
          name: faker.person.firstName(),
          birthDate: faker.date.birthdate({ min: 1, max: 14, mode: 'age' }),
        })),
      })
    }

    clients.push(client)
  }
  console.log(`✅ ${clients.length} clientes criados`)

  // ── SALES + ITEMS + TIMELINE ───────────────
  let totalSales = 0

  for (const client of clients) {
    const saleCount = faker.number.int({ min: 0, max: 4 })

    for (let s = 0; s < saleCount; s++) {
      const saleProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 1, max: 4 }))
      const items = saleProducts.map((p) => ({
        productId: p.id,
        quantity: faker.number.int({ min: 1, max: 3 }),
        unitPrice: Number(p.price),
        discount: Math.random() > 0.7 ? faker.number.float({ min: 5, max: 30, fractionDigits: 2 }) : null,
      }))

      const subtotal = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0)
      const discount = items.reduce((acc, i) => acc + (i.discount ?? 0), 0)
      const total = Math.max(subtotal - discount, 0)

      const saleStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'DELIVERED', 'DELIVERED'] as const
      const status = saleStatuses[faker.number.int({ min: 0, max: 4 })]

      const sale = await prisma.sale.create({
        data: {
          clientId: client.id,
          status,
          total,
          discount: discount > 0 ? discount : null,
          notes: Math.random() > 0.6 ? faker.lorem.sentence() : null,
          deliveryAt: status === 'DELIVERED' ? daysAgo(faker.number.int({ min: 1, max: 30 })) : daysFromNow(faker.number.int({ min: 1, max: 14 })),
          createdAt: daysAgo(faker.number.int({ min: 1, max: 60 })),
          aiSummary: `Venda de ${items.length} item(s) no valor de R$ ${total.toFixed(2)}.`,
          items: {
            create: items,
          },
        },
      })

      // Timeline para cada venda
      await prisma.timelineEvent.create({
        data: {
          clientId: client.id,
          saleId: sale.id,
          type: 'SALE_CREATED',
          title: 'Venda registrada',
          body: `Venda de R$ ${total.toFixed(2)} com ${items.length} produto(s).`,
          createdAt: sale.createdAt,
        },
      })

      if (status === 'DELIVERED') {
        await prisma.timelineEvent.create({
          data: {
            clientId: client.id,
            saleId: sale.id,
            type: 'SALE_UPDATED',
            title: 'Venda entregue',
            body: 'Pedido entregue com sucesso.',
            createdAt: sale.deliveryAt ?? new Date(),
          },
        })
      }

      totalSales++
    }
  }
  console.log(`✅ ${totalSales} vendas criadas`)

  // ── REMINDERS ─────────────────────────────
  const reminderTemplates = [
    { title: 'Ligar para cliente', priority: 'HIGH' as const },
    { title: 'Enviar catálogo novo', priority: 'MEDIUM' as const },
    { title: 'Confirmar entrega', priority: 'HIGH' as const },
    { title: 'Aniversário da cliente', priority: 'MEDIUM' as const },
    { title: 'Follow-up pós-venda', priority: 'LOW' as const },
  ]

  let totalReminders = 0
  for (const client of clients.slice(0, 5)) {
    const tmpl = reminderTemplates[totalReminders % reminderTemplates.length]
    const isPast = Math.random() > 0.5
    await prisma.reminder.create({
      data: {
        clientId: client.id,
        title: tmpl.title,
        body: faker.lorem.sentence(),
        dueAt: isPast ? daysAgo(faker.number.int({ min: 1, max: 7 })) : daysFromNow(faker.number.int({ min: 1, max: 14 })),
        status: isPast ? 'COMPLETED' : 'PENDING',
        priority: tmpl.priority,
        aiGenerated: Math.random() > 0.6,
        aiReason: 'Gerado com base no histórico de compras da cliente.',
      },
    })
    totalReminders++
  }
  console.log(`✅ ${totalReminders} lembretes criados`)

  // ── INTERACTIONS + AUDIO ──────────────────
  let totalInteractions = 0
  for (const client of clients.slice(0, 4)) {
    const interaction = await prisma.interaction.create({
      data: {
        clientId: client.id,
        type: 'AUDIO_NOTE',
        notes: 'Atendimento registrado via áudio após a venda.',
        aiTranscription: `"Oi, acabei de atender a ${client.name}. Ela gostou muito do vestido floral e quer ver mais opções na próxima semana. Tem interesse em looks para festa de formatura da filha."`,
        aiSummary: `Cliente interessada em looks para formatura. Retornar em 7 dias com opções.`,
        aiSentiment: 'positive',
        aiKeywords: ['formatura', 'vestido', 'festa', 'retorno'],
        aiActionItems: {
          items: ['Separar looks para formatura', 'Ligar em 7 dias', 'Enviar catálogo festa'],
        },
        audio: {
          create: {
            url: `https://placeholder.supabase.co/storage/v1/object/audios/${faker.string.uuid()}.webm`,
            bucket: 'audios',
            path: `${user.id}/${client.id}/${faker.string.uuid()}.webm`,
            durationSecs: faker.number.int({ min: 15, max: 120 }),
            fileSizeBytes: faker.number.int({ min: 50000, max: 2000000 }),
            mimeType: 'audio/webm',
            transcription: `Atendimento com ${client.name}. Cliente satisfeita com os produtos.`,
            transcribedAt: new Date(),
            whisperModel: 'whisper-large-v3',
          },
        },
      },
    })

    await prisma.timelineEvent.create({
      data: {
        clientId: client.id,
        type: 'INTERACTION_REGISTERED',
        title: 'Atendimento registrado',
        body: interaction.aiSummary,
        aiGenerated: true,
        aiInsight: 'IA identificou oportunidade de venda futura.',
        createdAt: interaction.createdAt,
      },
    })

    totalInteractions++
  }
  console.log(`✅ ${totalInteractions} interações + áudios criados`)

  // ── AI INSIGHTS na timeline ────────────────
  for (const client of clients.slice(0, 3)) {
    await prisma.timelineEvent.create({
      data: {
        clientId: client.id,
        type: 'AI_INSIGHT',
        title: 'Insight da IA',
        body: `${client.name} não compra há mais de 30 dias. Boa oportunidade para reengajamento com novidades da coleção.`,
        aiGenerated: true,
        aiInsight: 'Baseado no histórico de compras e frequência média da cliente.',
      },
    })
  }
  console.log('✅ Insights da IA adicionados na timeline')

  console.log('\n🎉 Seed finalizado com sucesso!')
  console.log(`   👤 1 usuário`)
  console.log(`   🛍️  ${products.length} produtos`)
  console.log(`   👩 ${clients.length} clientes`)
  console.log(`   💰 ${totalSales} vendas`)
  console.log(`   🔔 ${totalReminders} lembretes`)
  console.log(`   🎙️  ${totalInteractions} interações com áudio`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
