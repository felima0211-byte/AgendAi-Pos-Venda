'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface EditableClient {
  id: string
  name: string
  phone: string | null
  email: string | null
  city: string | null
  status: string
}

interface EditClientModalProps {
  open: boolean
  client: EditableClient
  onClose: () => void
  onSaved: () => void
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'VIP', label: 'VIP' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'INACTIVE', label: 'Inativa' },
]

export function EditClientModal({ open, client, onClose, onSaved }: EditClientModalProps) {
  const [form, setForm] = useState({
    name: client.name,
    phone: client.phone ?? '',
    email: client.email ?? '',
    city: client.city ?? '',
    clientStatus: client.status,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome obrigatório'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      onSaved()
      onClose()
    } catch {
      setError('Erro ao salvar alterações')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">Editar cliente</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {(['name', 'phone', 'email', 'city'] as const).map((field) => (
            <input
              key={field}
              value={form[field]}
              onChange={set(field)}
              placeholder={
                field === 'name' ? 'Nome *' :
                field === 'phone' ? 'Telefone' :
                field === 'email' ? 'E-mail' : 'Cidade'
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          ))}

          <div className="flex flex-wrap gap-2 pt-1">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, clientStatus: opt.value }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  form.clientStatus === opt.value
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-semibold text-sm disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
