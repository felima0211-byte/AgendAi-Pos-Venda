'use client'

import { useState } from 'react'
import { X, Plus, Trash2, ShoppingBag } from 'lucide-react'

interface Item {
  name: string
  quantity: number
}

interface Props {
  open: boolean
  clientId: string
  clientName: string
  onClose: () => void
  onSaved: () => void
}

export function NovaVendaModal({ open, clientId, clientName, onClose, onSaved }: Props) {
  const [itens, setItens] = useState<Item[]>([{ name: '', quantity: 1 }])
  const [valorTotal, setValorTotal] = useState('')
  const [observacao, setObservacao] = useState('')
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  if (!open) return null

  function addItem() {
    setItens(prev => [...prev, { name: '', quantity: 1 }])
  }

  function removeItem(i: number) {
    setItens(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateItem(i: number, field: keyof Item, value: string | number) {
    setItens(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it))
  }

  async function handleSave() {
    const itensFiltrados = itens.filter(it => it.name.trim())
    const total = parseFloat(valorTotal.replace(',', '.'))

    if (itensFiltrados.length === 0 && !observacao.trim()) {
      setErro('Adicione ao menos um produto ou uma observação.')
      return
    }

    setSaving(true)
    setErro('')
    try {
      const res = await fetch('/api/clients/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          produtos: itensFiltrados,
          valorTotal: isNaN(total) ? 0 : total,
          observacao: observacao.trim() || null,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        setErro(d.error ?? 'Erro ao salvar venda.')
        return
      }

      setItens([{ name: '', quantity: 1 }])
      setValorTotal('')
      setObservacao('')
      onSaved()
      onClose()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div
        className="w-full max-w-lg rounded-t-3xl pb-8"
        style={{ backgroundColor: '#fff', maxHeight: '90dvh', overflowY: 'auto' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} style={{ color: '#6C4CF0' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#1A1830' }}>Nova venda</p>
              <p className="text-xs" style={{ color: '#6B6884' }}>{clientName}</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X size={20} style={{ color: '#6B6884' }} />
          </button>
        </div>

        <div className="px-5 pt-4 flex flex-col gap-4">

          {/* Produtos */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B6884' }}>
              Produtos
            </p>
            <div className="flex flex-col gap-2">
              {itens.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nome do produto"
                    value={item.name}
                    onChange={e => updateItem(i, 'name', e.target.value)}
                    className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                    style={{ borderColor: '#E2E0EC', color: '#1A1830' }}
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 rounded-xl border px-2 py-2 text-sm text-center outline-none focus:ring-2"
                    style={{ borderColor: '#E2E0EC', color: '#1A1830' }}
                  />
                  {itens.length > 1 && (
                    <button onClick={() => removeItem(i)}>
                      <Trash2 size={16} style={{ color: '#C4342F' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addItem}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold py-1"
              style={{ color: '#6C4CF0' }}
            >
              <Plus size={14} /> Adicionar produto
            </button>
          </div>

          {/* Valor total */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B6884' }}>
              Valor total (R$)
            </p>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valorTotal}
              onChange={e => setValorTotal(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ borderColor: '#E2E0EC', color: '#1A1830' }}
            />
          </div>

          {/* Observação */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B6884' }}>
              Observação (opcional)
            </p>
            <textarea
              placeholder="Ex: pagamento via Pix, entrega na próxima semana..."
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              rows={2}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 resize-none"
              style={{ borderColor: '#E2E0EC', color: '#1A1830' }}
            />
          </div>

          {erro && <p className="text-xs font-semibold" style={{ color: '#C4342F' }}>{erro}</p>}

          {/* Botão */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{ backgroundColor: '#6C4CF0', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Salvando...' : 'Registrar venda'}
          </button>
        </div>
      </div>
    </div>
  )
}
