'use client'

import { useState } from 'react'
import { Mic, AudioLines } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RegistrarAtendimentoSheet } from '@/features/atendimento/components/RegistrarAtendimentoSheet'

export function RecordAttendance() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-4 mt-5 bg-[var(--color-primary-tint)] rounded-[var(--radius-xl)] p-5 animate-slide-up">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <h3 className="text-[17px] font-bold text-[var(--color-text-primary)] leading-snug">
            Registrar novo atendimento
          </h3>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-snug">
            Grave um áudio contando sobre o atendimento realizado.
          </p>
        </div>
        {/* Ilustração — onda sonora em "tela" branca sobre círculo tint */}
        <div className="w-24 h-24 rounded-full bg-[var(--color-primary-tint-3)] flex items-center justify-center shrink-0">
          <div className="w-12 h-16 rounded-[14px] bg-[var(--color-surface)] border border-[#E0D8F8] flex items-center justify-center">
            <AudioLines size={22} className="text-[var(--color-primary)]" />
          </div>
        </div>
      </div>

      <button
        onClick={() => setOpen(true)}
        className={cn(
          'mt-4 flex items-center justify-center gap-2',
          'bg-[var(--color-primary)] text-white',
          'py-3.5 px-7 rounded-[var(--radius-full)] font-semibold text-sm',
          'shadow-[var(--shadow-primary)]',
          'transition-transform duration-[var(--duration-base)] active:scale-[0.98]',
        )}
      >
        <Mic size={18} />
        Registrar atendimento
      </button>

      <RegistrarAtendimentoSheet open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
