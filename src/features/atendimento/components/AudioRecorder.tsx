'use client'

import { Mic, Square, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecorderState } from '@/hooks/use-audio-recorder'

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface AudioRecorderProps {
  state: RecorderState
  duration: number
  error: string | null
  isSupported: boolean
  onStart: () => void
  onStop: () => void
}

export function AudioRecorder({
  state,
  duration,
  error,
  isSupported,
  onStart,
  onStop,
}: AudioRecorderProps) {
  const isRecording = state === 'recording'
  const isRequesting = state === 'requesting'

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-14 h-14 rounded-[var(--radius-2xl)] bg-[var(--color-error)]/10 flex items-center justify-center">
          <AlertCircle size={24} className="text-[var(--color-error)]" />
        </div>
        <p className="text-sm text-center text-[var(--color-text-secondary)] max-w-xs">
          Seu navegador não suporta gravação de áudio. Use Chrome, Safari ou Firefox atualizado.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Botão principal */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings — só quando gravando */}
        {isRecording && (
          <>
            <span className="absolute w-32 h-32 rounded-full bg-[var(--color-primary)]/15 animate-ping" />
            <span className="absolute w-24 h-24 rounded-full bg-[var(--color-primary)]/20 animate-ping [animation-delay:200ms]" />
          </>
        )}

        <button
          onClick={isRecording ? onStop : onStart}
          disabled={isRequesting}
          aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
          className={cn(
            'relative w-20 h-20 rounded-full flex items-center justify-center',
            'transition-all duration-[var(--duration-slow)] active:scale-95 shadow-[var(--shadow-lg)]',
            isRecording
              ? 'bg-[var(--color-error)] shadow-[0_8px_24px_rgba(239,68,68,0.35)]'
              : isRequesting
                ? 'bg-[var(--color-primary)]/60 cursor-wait'
                : 'bg-[var(--color-primary)] shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-dark)]',
          )}
        >
          {isRecording ? (
            <Square size={28} className="text-white fill-white" />
          ) : (
            <Mic size={28} className="text-white" />
          )}
        </button>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center gap-1">
        <span
          className={cn(
            'text-3xl font-bold tabular-nums tracking-wide transition-colors',
            isRecording ? 'text-[var(--color-error)]' : 'text-[var(--color-text-primary)]',
          )}
        >
          {formatDuration(duration)}
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {isRecording ? (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-error)] animate-pulse-soft" />
              Gravando…
            </span>
          ) : isRequesting ? (
            'Aguardando permissão…'
          ) : (
            'Pressione para gravar'
          )}
        </span>
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-start gap-2 bg-[var(--color-error)]/8 rounded-[var(--radius-xl)] p-3 max-w-xs">
          <AlertCircle size={16} className="text-[var(--color-error)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--color-error)] leading-snug">{error}</p>
        </div>
      )}
    </div>
  )
}
