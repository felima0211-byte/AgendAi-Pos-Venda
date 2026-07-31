import { Users, ShoppingBag, Clock, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardData } from '../hooks/use-dashboard'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
  sub: string
  bgClass: string
  borderClass: string
  iconClass: string
  subClass: string
  delay?: string
  onClick?: () => void
}

function StatCard({
  icon, title, value, sub, bgClass, borderClass, iconClass, subClass, delay = '0ms', onClick,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex flex-col gap-2 p-3 rounded-[var(--radius-lg)] border text-left w-full min-h-[128px]',
        'animate-scale-in transition-transform',
        onClick && 'active:scale-[0.97] cursor-pointer',
        bgClass, borderClass,
      )}
      style={{ animationDelay: delay }}
    >
      <span className={cn('shrink-0', iconClass)}>{icon}</span>
      <span className="text-[13px] font-medium text-[var(--color-text-body)] leading-tight">{title}</span>
      <span className="text-[22px] font-bold text-[var(--color-text-primary)] leading-none">{value}</span>
      <span className={cn('text-[12px] font-semibold leading-tight mt-auto', subClass)}>{sub}</span>
    </button>
  )
}

export function StatsGrid({
  stats,
  onClientesClick,
  onVendasClick,
  onLembretesClick,
  onPosVendaClick,
}: {
  stats: DashboardData['stats']
  onClientesClick?: () => void
  onVendasClick?: () => void
  onLembretesClick?: () => void
  onPosVendaClick?: () => void
}) {
  const { clientes, vendas, lembretes, posVendas } = stats

  return (
    <div className="grid grid-cols-4 gap-2 px-4 pt-2">
      <StatCard
        icon={<Users size={22} />}
        title="Clientes"
        value={clientes.total}
        sub={clientes.total > 0 ? `${clientes.inativos} inativos` : 'Nenhum ainda'}
        bgClass="bg-[#F1EEFB]"
        borderClass="border-[#E0D8F8]"
        iconClass="text-[var(--color-primary)]"
        subClass="text-[var(--color-primary)]"
        delay="0ms"
        onClick={onClientesClick}
      />
      <StatCard
        icon={<ShoppingBag size={22} />}
        title="Vendas"
        value={vendas.total}
        sub={vendas.total > 0 ? vendas.label : 'Nenhuma ainda'}
        bgClass="bg-[#E4F6EC]"
        borderClass="border-[#CDECD9]"
        iconClass="text-[var(--color-success)]"
        subClass="text-[var(--color-success)]"
        delay="60ms"
        onClick={onVendasClick}
      />
      <StatCard
        icon={<Clock size={22} />}
        title="Lembretes"
        value={lembretes.total}
        sub={lembretes.total > 0 ? `${lembretes.concluidos} concluídos` : 'Nenhum ainda'}
        bgClass="bg-[#FCE8D6]"
        borderClass="border-[#F5D6B8]"
        iconClass="text-[var(--color-warning)]"
        subClass="text-[var(--color-warning)]"
        delay="120ms"
        onClick={onLembretesClick}
      />
      <StatCard
        icon={<MessageCircle size={22} />}
        title="Pós-vendas"
        value={posVendas.total}
        sub={posVendas.total > 0 ? posVendas.status : 'Nenhum ainda'}
        bgClass="bg-[#FBE4EC]"
        borderClass="border-[#F4CEDD]"
        iconClass="text-[#C2497A]"
        subClass="text-[#C2497A]"
        delay="180ms"
        onClick={onPosVendaClick}
      />
    </div>
  )
}
