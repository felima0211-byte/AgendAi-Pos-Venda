'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AppError]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
      <div className="w-14 h-14 rounded-[var(--radius-2xl)] bg-[var(--color-error)]/10 flex items-center justify-center">
        <AlertTriangle size={24} className="text-[var(--color-error)]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-[var(--color-text-primary)]">Algo deu errado</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
      </div>
      <Button onClick={reset} size="sm">
        Tentar novamente
      </Button>
    </div>
  )
}
