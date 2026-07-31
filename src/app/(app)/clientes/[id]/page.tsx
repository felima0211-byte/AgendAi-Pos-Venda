'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Mail, MapPin, Edit2, Trash2, ShoppingBag, Clock, Mic, Sparkles } from 'lucide-react'
import { TimelineList } from '@/features/timeline/components/TimelineList'
import { EditClientModal } from '@/features/clientes/components/EditClientModal'
import { MessageGeneratorSheet } from '@/features/mensagens/components/MessageGeneratorSheet'

interface ClientDetail {
  id: string
  name: string
  phone: string | null
  email: string | null
  city: string | null
  address: string | null
  status: string
  tags: string[]
  notes: string | null
  _count: { sales: number; reminders: number; interactions: number }
  sales: Array<{ id: string; total: number; status: string; createdAt: string }>
  interactions: Array<{ id: string; transcription: string | null; createdAt: string }>
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativa', INACTIVE: 'Inativa', PROSPECT: 'Prospect', VIP: 'VIP'
}

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'timeline' | 'vendas' | 'atendimentos'>('timeline')
  const [editOpen, setEditOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)

  const loadClient = () => {
    setLoading(true)
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(setClient)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadClient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Remover esta cliente?')) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.push('/clientes')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
    </div>
  )

  if (!client) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Cliente não encontrada</p>
    </div>
  )

  const initials = client.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center"
            >
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={handleDelete} className="w-9 h-9 rounded-xl border border-red-100 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
            <span className="text-xl font-bold text-violet-600">{initials}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
            <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
              {STATUS_LABEL[client.status]}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {client.phone && (
            <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />{client.phone}
            </a>
          )}
          {client.email && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />{client.email}
            </p>
          )}
          {client.city && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />{client.city}
            </p>
          )}
        </div>

        {/* Gerar mensagem com IA (Fatia 12) */}
        <button
          onClick={() => setMessageOpen(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" /> Gerar mensagem
        </button>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: ShoppingBag, count: client._count.sales, label: 'Vendas' },
            { icon: Clock, count: client._count.reminders, label: 'Lembretes' },
            { icon: Mic, count: client._count.interactions, label: 'Atendimentos' },
          ].map(({ icon: Icon, count, label }) => (
            <div key={label} className="bg-gray-50 rounded-xl py-2">
              <Icon className="w-4 h-4 text-violet-400 mx-auto mb-1" />
              <p className="text-base font-bold text-gray-900">{count}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10">
        {(['timeline', 'vendas', 'atendimentos'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${
              tab === t ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {tab === 'timeline' && <TimelineList clientId={id} />}

        {tab === 'vendas' && (
          <div className="space-y-3">
            {client.sales.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-10">Nenhuma venda registrada</p>
            )}
            {client.sales.map(sale => (
              <div key={sale.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-900">R$ {Number(sale.total).toFixed(2).replace('.', ',')}</p>
                  <span className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{sale.status}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'atendimentos' && (
          <div className="space-y-3">
            {client.interactions.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-10">Nenhum atendimento registrado</p>
            )}
            {client.interactions.map(inter => (
              <div key={inter.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{new Date(inter.createdAt).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm text-gray-700 line-clamp-3">{inter.transcription ?? 'Sem transcrição'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditClientModal
        open={editOpen}
        client={{
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          city: client.city,
          status: client.status,
        }}
        onClose={() => setEditOpen(false)}
        onSaved={loadClient}
      />

      <MessageGeneratorSheet
        open={messageOpen}
        clientId={client.id}
        clientPhone={client.phone}
        defaultType="POST_SALE"
        onClose={() => setMessageOpen(false)}
      />
    </div>
  )
}
