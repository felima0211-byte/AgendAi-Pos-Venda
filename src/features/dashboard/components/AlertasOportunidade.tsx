'use client'

import { useEffect, useState } from 'react'
import { Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Alerta {
  clientId: string
  clientName: string
  diasSemCompra: number
  ultimaCompra: string | null
}

export function AlertasOportunidade() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [isNovo, setIsNovo] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/oportunidades')
      .then((r) => r.json())
      .then((d) => setAlertas(d.alertas ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isNovo) return
    const t = setTimeout(() => setIsNovo(false), 5000)
    return () => clearTimeout(t)
  }, [isNovo])

  if (loading || alertas.length === 0) return null

  return (
    <div className="mx-4 mb-4 relative">
      {/* Badge novidade */}
      {isNovo && (
        <span
          className="absolute -top-2 -right-1 z-10 px-2 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: '#C46A1F' }}
        >
          Novo
        </span>
      )}

      <div className="flex items-center gap-2 mb-2 px-1">
        <Bell size={14} style={{ color: '#C46A1F' }} />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#C46A1F' }}>
          Oportunidades de retorno
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {alertas.slice(0, 3).map((a) => (
          <Link
            key={a.clientId}
            href={`/clientes/${a.clientId}`}
            className="flex items-center justify-between rounded-2xl px-4 py-3 gap-3"
            style={{ backgroundColor: '#FFF7ED', border: '1px solid #FDE8C8' }}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-semibold truncate" style={{ color: '#1A1830' }}>
                {a.clientName}
              </span>
              <span className="text-xs" style={{ color: '#C46A1F' }}>
                {a.diasSemCompra} dias sem comprar
                {a.ultimaCompra ? ` · última em ${new Date(a.ultimaCompra).toLocaleDateString('pt-BR')}` : ''}
              </span>
            </div>
            <ChevronRight size={16} style={{ color: '#C46A1F', flexShrink: 0 }} />
          </Link>
        ))}

        {alertas.length > 3 && (
          <Link
            href="/clientes"
            className="text-center text-xs font-semibold py-2"
            style={{ color: '#C46A1F' }}
          >
            Ver mais {alertas.length - 3} cliente{alertas.length - 3 > 1 ? 's' : ''} para retomar
          </Link>
        )}
      </div>
    </div>
  )
}
