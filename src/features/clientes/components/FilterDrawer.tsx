'use client'

import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'ACTIVE', label: 'Ativas' },
  { value: 'VIP', label: 'VIP' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'INACTIVE', label: 'Inativas' },
]

interface FilterDrawerProps {
  open: boolean
  status: string
  onStatusChange: (s: string) => void
  onClose: () => void
}

export function FilterDrawer({ open, status, onStatusChange, onClose }: FilterDrawerProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 transition-transform duration-300',
        open ? 'translate-y-0' : 'translate-y-full'
      )}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">Filtrar clientes</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onStatusChange(opt.value); onClose() }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
                status === opt.value
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-600 border-gray-200'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
