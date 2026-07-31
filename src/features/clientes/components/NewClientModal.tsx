'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface NewClientModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function NewClientModal({ open, onClose, onCreated }: NewClientModalProps) {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome obrigatório'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erro ao cadastrar')
      setForm({ name: '', phone: '', email: '', city: '' })
      toast('Cliente cadastrada!', 'success')
      onCreated()
      onClose()
    } catch {
      setError('Erro ao cadastrar cliente')
      toast('Erro ao cadastrar cliente', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">Nova cliente</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {(['name', 'phone', 'email', 'city'] as const).map(field => (
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

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-semibold text-sm disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
