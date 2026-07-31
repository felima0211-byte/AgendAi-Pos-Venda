'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Sparkles, Search, RefreshCw } from 'lucide-react'

interface SmartResult {
  id: string
  name: string
  phone: string | null
  daysSincePurchase: number | null
  salesCount: number
  matchReason: string
}

const EXAMPLES = [
  'Quem comprou manta?',
  'Quem tem bebê de aproximadamente 1 ano?',
  'Quem está há mais de 60 dias sem comprar?',
  'Quem comprou presente para neto?',
]

interface SmartSearchSheetProps {
  open: boolean
  onClose: () => void
}

export function SmartSearchSheet({ open, onClose }: SmartSearchSheetProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [interpretation, setInterpretation] = useState('')
  const [results, setResults] = useState<SmartResult[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const run = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error?.message ?? 'Erro na busca')
      setInterpretation(json.data.interpretation ?? '')
      setResults(json.data.results ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro na busca')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" /> Busca inteligente
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {/* Campo */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run(query)}
            placeholder="Pergunte em linguagem natural..."
            className="w-full pl-9 pr-20 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            onClick={() => run(query)}
            disabled={loading || !query.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold disabled:opacity-40"
          >
            Buscar
          </button>
        </div>

        {/* Exemplos */}
        {!searched && (
          <div className="flex flex-wrap gap-2 mb-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setQuery(ex); run(ex) }}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
            <RefreshCw className="w-4 h-4 animate-spin" /> Consultando sua base...
          </div>
        )}

        {error && <p className="text-sm text-red-500 py-3">{error}</p>}

        {!loading && searched && !error && (
          <>
            {interpretation && (
              <p className="text-xs text-gray-500 bg-violet-50 rounded-lg px-3 py-2 my-3">{interpretation}</p>
            )}
            {results.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                Nenhuma cliente encontrada para essa busca na sua base.
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                <p className="text-xs text-gray-400">{results.length} encontrada(s)</p>
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => router.push(`/clientes/${r.id}`)}
                    className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                      <span className="text-[10px] text-gray-400">{r.salesCount} venda(s)</span>
                    </div>
                    <p className="text-xs text-violet-500 mt-0.5">{r.matchReason}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
