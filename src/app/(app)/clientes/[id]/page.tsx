'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Mail, MapPin, Edit2, Trash2, ShoppingBag, Clock, Mic, Sparkles } from 'lucide-react'
import { TimelineList } from '@/features/timeline/components/TimelineList'
import { EditClientModal } from '@/features/clientes/components/EditClientModal'
import { MessageGeneratorSheet } from '@/features/mensagens/components/MessageGeneratorSheet'
import { NovaVendaModal } from '@/features/clientes/components/NovaVendaModal'

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
  sales: Array<{
    id: string; total: number; status: string; createdAt: string; notes: string | null
    items: Array<{ quantity: number; unitPrice: number; product: { name: string } }>
  }>
  interactions: Array<{
    id: string; type: string; createdAt: string
    aiTranscription: string | null
    aiSummary: string | null
    notes: string | null
    aiExtractedData: { produtos?: string[]; quantidades?: string[]; valorTotal?: number | null; resumo?: string | null } | null
  }>
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativa', INACTIVE: 'Inativa', PROSPECT: 'Prospect', VIP: 'VIP'
}

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'timeline' | 'vendas' | 'atendimentos'>('vendas')
  const [editOpen, setEditOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [novaVendaOpen, setNovaVendaOpen] = useState(false)
  const [editVenda, setEditVenda] = useState<{ id: string; notes: string; total: number } | null>(null)
  const [savingVenda, setSavingVenda] = useState(false)

  const saveEditVenda = async () => {
    if (!editVenda) return
    setSavingVenda(true)
    await fetch(`/api/clients/sales/${editVenda.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: editVenda.notes, valorTotal: editVenda.total }),
    })
    setSavingVenda(false)
    setEditVenda(null)
    loadClient()
  }

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

        {/* Ações principais */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setNovaVendaOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98]"
            style={{ backgroundColor: '#6C4CF0' }}
          >
            <ShoppingBag className="w-4 h-4" /> Nova venda
          </button>
          <button
            onClick={() => setMessageOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm active:scale-[0.98]"
            style={{ backgroundColor: '#EDE9FD', color: '#6C4CF0' }}
          >
            <Sparkles className="w-4 h-4" /> Mensagem
          </button>
        </div>

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
        {([
          { key: 'vendas', label: 'Vendas' },
          { key: 'atendimentos', label: 'Atendimentos' },
          { key: 'timeline', label: 'Timeline' },
        ] as const).map(({ key: t, label }) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              tab === t ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {tab === 'timeline' && <TimelineList clientId={id} />}

        {tab === 'vendas' && (
          <div>
            <button
              onClick={() => setNovaVendaOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm mb-4"
              style={{ backgroundColor: '#6C4CF0', color: '#fff' }}
            >
              <ShoppingBag className="w-4 h-4" /> + Nova venda
            </button>

            {client.sales.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">Nenhuma venda registrada</p>
            ) : (
              <div className="relative">
                {/* Linha vertical da timeline */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100" />

                <div className="space-y-4">
                  {client.sales.map(sale => (
                    <div key={sale.id} className="flex gap-4 items-start">
                      {/* Ponto da timeline */}
                      <div className="shrink-0 w-6 h-6 rounded-full border-2 border-violet-400 bg-white flex items-center justify-center z-10">
                        <ShoppingBag className="w-3 h-3 text-violet-400" />
                      </div>

                      <div className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 -mt-1">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                            {new Date(sale.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-bold text-violet-600">
                              {Number(sale.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <button
                              onClick={() => setEditVenda({ id: sale.id, notes: sale.notes ?? '', total: Number(sale.total) })}
                              className="p-1 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        </div>

                        {sale.items?.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {sale.items.map((it, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
                                {it.product.name} ×{it.quantity}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">Venda registrada</p>
                        )}

                        {sale.notes && (
                          <p className="text-xs text-gray-500 mt-2 border-t border-gray-50 pt-2">
                            {sale.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'atendimentos' && (
          <div className="space-y-3">
            {client.interactions.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-10">Nenhum atendimento registrado</p>
            )}
            {client.interactions.map(inter => {
              const transcricao = inter.aiTranscription ?? inter.notes
              const resumo = inter.aiSummary ?? inter.aiExtractedData?.resumo
              const produtos = inter.aiExtractedData?.produtos ?? []
              const valor = inter.aiExtractedData?.valorTotal
              return (
                <div key={inter.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-600">
                      {inter.type === 'AUDIO_NOTE' ? <Mic className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                      {inter.type === 'AUDIO_NOTE' ? 'Áudio' : 'Atendimento'}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(inter.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>

                  {resumo && <p className="text-sm font-medium text-gray-900 mb-1">{resumo}</p>}

                  {/* O que foi dito e transcrito */}
                  {transcricao && (
                    <div className="mt-1.5 rounded-xl bg-gray-50 p-2.5">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Transcrição</p>
                      <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">{transcricao}</p>
                    </div>
                  )}

                  {(produtos.length > 0 || valor) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {produtos.map((p, i) => (
                        <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{p}</span>
                      ))}
                      {!!valor && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                          {Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      )}
                    </div>
                  )}

                  {!transcricao && !resumo && <p className="text-sm text-gray-400">Sem transcrição.</p>}
                </div>
              )
            })}
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

      <NovaVendaModal
        open={novaVendaOpen}
        clientId={client.id}
        clientName={client.name}
        onClose={() => setNovaVendaOpen(false)}
        onSaved={loadClient}
      />

      <MessageGeneratorSheet
        open={messageOpen}
        clientId={client.id}
        clientPhone={client.phone}
        defaultType="POST_SALE"
        onClose={() => setMessageOpen(false)}
      />

      {/* Modal editar venda */}
      {editVenda && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setEditVenda(null)}>
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-800">Editar venda</h3>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Valor total (R$)</label>
              <input
                type="number"
                step="0.01"
                value={editVenda.total}
                onChange={(e) => setEditVenda((v) => v && ({ ...v, total: Number(e.target.value) }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Descrição / observação</label>
              <textarea
                rows={3}
                value={editVenda.notes}
                onChange={(e) => setEditVenda((v) => v && ({ ...v, notes: e.target.value }))}
                placeholder="Ex.: cliente adorou, pediu para avisar sobre novidades..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditVenda(null)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={saveEditVenda}
                disabled={savingVenda}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: '#6C4CF0' }}
              >
                {savingVenda ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
