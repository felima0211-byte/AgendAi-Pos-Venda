'use client'

import { Phone, MapPin, ShoppingBag, Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ClientSummary } from '../hooks/use-clients'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
  PROSPECT: 'bg-blue-100 text-blue-700',
  VIP: 'bg-amber-100 text-amber-700',
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
  PROSPECT: 'Prospect',
  VIP: 'VIP',
}

interface ClientCardProps {
  client: ClientSummary
  onClick?: () => void
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  const lastSale = client.sales[0]
  const initials = client.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-violet-600">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-gray-900 truncate">{client.name}</p>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', STATUS_STYLES[client.status])}>
              {client.status === 'VIP' && <Star className="inline w-2.5 h-2.5 mr-0.5 -mt-0.5" />}
              {STATUS_LABEL[client.status]}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />{client.phone}
              </span>
            )}
            {client.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />{client.city}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              {client._count.sales} {client._count.sales === 1 ? 'venda' : 'vendas'}
            </span>
            {lastSale && (
              <span className="text-gray-300">•</span>
            )}
            {lastSale && (
              <span>
                Última: R$ {Number(lastSale.total).toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          {client.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {client.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] bg-violet-50 text-violet-500 px-1.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
