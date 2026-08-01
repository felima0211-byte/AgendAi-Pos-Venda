'use client'

import { User, Mail, Phone, IdCard, LogOut } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { useCurrentUser } from '@/hooks/use-current-user'

function initials(name: string | null) {
  if (!name) return 'V'
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export default function MaisPage() {
  const { user, displayName, email, avatarUrl, signOut } = useCurrentUser()

  const phone = user?.phone ?? null

  const info = [
    { icon: User, label: 'Nome', value: displayName ?? '—' },
    { icon: Mail, label: 'E-mail', value: email ?? '—' },
    { icon: Phone, label: 'Telefone', value: phone ?? 'Não informado' },
    { icon: IdCard, label: 'Conta', value: 'Vendedora' },
  ]

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-background)]">
      <header className="px-4 pt-6 pb-3">
        <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">Perfil</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)]">Seus dados e cadastro</p>
      </header>

      <main className="flex-1 px-4 pb-24">
        {/* Cartão do perfil */}
        <div className="flex items-center gap-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName ?? 'Perfil'} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[var(--color-primary-tint-2)] text-[var(--color-primary)] flex items-center justify-center text-lg font-bold">
              {initials(displayName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-base font-bold text-[var(--color-text-primary)] truncate">{displayName ?? 'Você'}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)] truncate">{email ?? ''}</p>
          </div>
        </div>

        {/* Dados / cadastro */}
        <div className="mt-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-4">
              <span className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary-tint)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-[var(--color-text-tertiary)]">{label}</p>
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <button
          onClick={signOut}
          className="mt-3 w-full flex items-center gap-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 active:scale-[0.99]"
        >
          <span className="w-9 h-9 rounded-[var(--radius-md)] bg-red-50 text-[var(--color-error)] flex items-center justify-center">
            <LogOut size={16} />
          </span>
          <span className="text-sm font-semibold text-[var(--color-error)]">Sair</span>
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
