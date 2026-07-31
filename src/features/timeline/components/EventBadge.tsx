import { Mic, ShoppingBag, Bell, User, MessageSquare, Tag } from 'lucide-react'
import { cn } from '@/utils/cn'

const EVENT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  INTERACTION: { label: 'Atendimento', icon: Mic, color: 'bg-violet-100 text-violet-600' },
  SALE_CREATED: { label: 'Venda', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-600' },
  SALE_UPDATED: { label: 'Venda', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-600' },
  REMINDER_SET: { label: 'Lembrete', icon: Bell, color: 'bg-amber-100 text-amber-600' },
  CLIENT_UPDATED: { label: 'Atualização', icon: User, color: 'bg-gray-100 text-gray-500' },
  NOTE: { label: 'Nota', icon: MessageSquare, color: 'bg-blue-100 text-blue-600' },
  TAG_ADDED: { label: 'Tag', icon: Tag, color: 'bg-pink-100 text-pink-600' },
}

const DEFAULT_CONFIG = { label: 'Evento', icon: MessageSquare, color: 'bg-gray-100 text-gray-500' }

export function EventBadge({ type }: { type: string }) {
  const config = EVENT_CONFIG[type] ?? DEFAULT_CONFIG
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', config.color)}>
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  )
}
