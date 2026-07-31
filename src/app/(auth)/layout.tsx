export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-[var(--shadow-primary)]">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
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
