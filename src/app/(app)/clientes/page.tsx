'use client'

import { useEffect, useState } from 'react'
import { Plus, SlidersHorizontal, Users, Sparkles } from 'lucide-react'
import { ClientCard } from '@/features/clientes/components/ClientCard'
import { SearchBar } from '@/features/clientes/components/SearchBar'
import { FilterDrawer } from '@/features/clientes/components/FilterDrawer'
import { NewClientModal } from '@/features/clientes/components/NewClientModal'
import { SmartSearchSheet } from '@/features/clientes/components/SmartSearchSheet'
import { useClients } from '@/features/clientes/hooks/use-clients'
import { BottomNav } from '@/components/layout/BottomNav'
import { useRouter } from 'next/navigation'

export default function ClientesPage() {
  const router = useRouter()
  const { clients, loading, hasMore, total, fetch, loadMore, refresh } = useClients()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [smartOpen, setSmartOpen] = useState(false)

  useEffect(() => { fetch('', '', true) }, [fetch])

  // Abre a busca inteligente quando vem de /clientes?smart=1
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('smart') === '1') {
      setSmartOpen(true)
    }
  }, [])

  const handleSearch = (v: string) => {
    setQ(v)
    fetch(v, status, true)
  }

  const handleStatus = (s: string) => {
    setStatus(s)
    fetch(q, s, true)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Clientes</h1>
            <p className="text-xs text-gray-400">{total} {total === 1 ? 'cliente' : 'clientes'}</p>
          </div>
          <button
            onClick={() => setNewOpen(true)}
            className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <button
            onClick={() => setSmartOpen(true)}
            aria-label="Busca inteligente"
            className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shrink-0"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setFilterOpen(true)}
            className="relative w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            {status && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-violet-600" />
            )}
          </button>
        </div>
      </div>

      {/* Lista */}
      <main className="flex-1 px-4 pt-4 pb-24 space-y-3">
        {clients.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            onClick={() => router.push(`/clientes/${client.id}`)}
          />
        ))}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-violet-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Nenhuma cliente encontrada</p>
            <p className="text-xs text-gray-400 mt-1">Cadastre sua primeira cliente</p>
          </div>
        )}

        {hasMore && !loading && (
          <button onClick={loadMore} className="w-full py-3 text-sm text-violet-600 font-medium">
            Carregar mais
          </button>
        )}
      </main>

      <BottomNav />

      <FilterDrawer
        open={filterOpen}
        status={status}
        onStatusChange={handleStatus}
        onClose={() => setFilterOpen(false)}
      />

      <NewClientModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={refresh}
      />

      <SmartSearchSheet open={smartOpen} onClose={() => setSmartOpen(false)} />
    </div>
  )
}
