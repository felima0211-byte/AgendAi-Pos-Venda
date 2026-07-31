import { cn } from '@/lib/utils'
import { Avatar } from './avatar'
import { Badge } from './badge'
import { Phone, MessageCircle, ChevronRight } from 'lucide-react'

type ClientStatus = 'active' | 'inactive' | 'lead' | 'vip'

const STATUS_MAP: Record<ClientStatus, { label: string; variant: 'success' | 'neutral' | 'accent' | 'primary' }> = {
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'neutral' },
  lead: { label: 'Lead', variant: 'accent' },
  vip: { label: 'VIP', variant: 'primary' },
}

interface ClientCardProps {
  name: string
  phone?: string
  email?: string
  status?: ClientStatus
  lastContact?: string
  avatarSrc?: string
  className?: string
  onPress?: () => void
  onPhone?: () => void
  onMessage?: () => void
}

function ClientCard({
  name,
  phone,
  email,
  status = 'active',
  lastContact,
  avatarSrc,
  className,
  onPress,
  onPhone,
  onMessage,
}: ClientCardProps) {
  const { label, variant } = STATUS_MAP[status]

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-2xl)]',
        'border border-[var(--color-border)] shadow-[var(--shadow-sm)]',
        'p-4 flex items-center gap-3',
        'transition-all duration-[var(--duration-base)]',
        onPress && 'cursor-pointer hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 active:scale-[0.99]',
        className,
      )}
      onClick={onPress}
      role={onPress ? 'button' : undefined}
    >
      <Avatar src={avatarSrc} name={name} size="lg" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-[var(--color-text-primary)] truncate">{name}</span>
          <Badge variant={variant} size="sm" dot>{label}</Badge>
        </div>
        {(phone || email) && (
          <p className="text-sm text-[var(--color-text-secondary)] truncate">{phone ?? email}</p>
        )}
        {lastContact && (
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Último contato: {lastContact}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onPhone && (
          <button
            onClick={(e) => { e.stopPropagation(); onPhone() }}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors"
            aria-label="Ligar"
          >
            <Phone size={16} />
          </button>
        )}
        {onMessage && (
          <button
            onClick={(e) => { e.stopPropagation(); onMessage() }}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors"
            aria-label="Mensagem"
          >
            <MessageCircle size={16} />
          </button>
        )}
        {onPress && (
          <ChevronRight size={16} className="text-[var(--color-text-tertiary)]" />
        )}
      </div>
    </div>
  )
}

export { ClientCard }
