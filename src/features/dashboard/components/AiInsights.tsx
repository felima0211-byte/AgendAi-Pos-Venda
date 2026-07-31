import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import type { DashboardData } from '../hooks/use-dashboard'

export function AiInsights({ insights }: { insights: DashboardData['aiInsights'] }) {

  return (
    <div className="px-4 mt-6 mb-4 animate-slide-up" style={{ animationDelay: '160ms' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[var(--color-text-primary)]">
          Insights da IA
        </h2>
        <Link
          href="/assistente"
          className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
        >
          Conversar com IA
        </Link>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Nenhum insight disponível ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start gap-3 bg-gradient-to-br from-violet-50 to-violet-50/50 border border-violet-100 rounded-[var(--radius-xl)] p-3"
            >
              <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={14} className="text-[var(--color-primary)]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-[var(--color-primary)]">
                  {insight.clientName}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
                  {insight.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
