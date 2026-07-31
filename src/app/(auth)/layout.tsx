export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-agendai.png"
            alt="AgendAI — Pós-Venda Inteligente"
            className="w-24 h-auto drop-shadow-[0_8px_20px_rgba(26,24,48,0.15)]"
          />
          <span className="text-[var(--text-h3)] font-bold text-[var(--color-text-primary)]">
            AgendAI
          </span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Seu assistente pessoal de vendas
          </span>
        </div>

        {children}
      </div>
    </div>
  )
}
