import { CheckCircle2, RefreshCw, Sparkles, Ruler, Heart, RotateCcw, Bell } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ReminderKind } from '../hooks/use-reminders'

const KIND_CONFIG: Record<ReminderKind, { label: string; icon: React.ElementType; color: string }> = {
  POST_SALE_CHECK: { label: 'Serviu?', icon: CheckCircle2, color: 'bg-blue-100 text-blue-600' },
  EXCHANGE_CHECK: { label: 'Troca', icon: RefreshCw, color: 'bg-orange-100 text-orange-600' },
  RECOMMEND: { label: 'Sugestão', icon: Sparkles, color: 'bg-violet-100 text-violet-600' },
  SIZE_UPDATE: { label: 'Tamanho', icon: Ruler, color: 'bg-pink-100 text-pink-600' },
  REACTIVATE: { label: 'Reativar', icon: Heart, color: 'bg-rose-100 text-rose-600' },
  WINBACK: { label: 'Recuperar', icon: RotateCcw, color: 'bg-amber-100 text-amber-600' },
  CUSTOM: { label: 'Lembrete', icon: Bell, color: 'bg-gray-100 text-gray-500' },
}

export function KindBadge({ kind }: { kind: ReminderKind }) {
  const config = KIND_CONFIG[kind] ?? KIND_CONFIG.CUSTOM
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', config.color)}>
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  )
}
