'use client'

import Link from 'next/link'
import { Mic, Sparkles, Search, Bell } from 'lucide-react'

const ACTIONS = [
  { href: '/atendimento', label: 'Gravar', icon: Mic, color: 'bg-violet-100 text-violet-600' },
  { href: '/assistente', label: 'Assistente', icon: Sparkles, color: 'bg-blue-100 text-blue-600' },
  { href: '/clientes?smart=1', label: 'Busca IA', icon: Search, color: 'bg-emerald-100 text-emerald-600' },
  { href: '/lembretes', label: 'Pós-venda', icon: Bell, color: 'bg-amber-100 text-amber-600' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2 px-4 pt-4">
      {ACTIONS.map(({ href, label, icon: Icon, color }) => (
        <Link key={href} href={href} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-gray-500 font-medium">{label}</span>
        </Link>
      ))}
    </div>
  )
}
