'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Trash2, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadState } from '../types'

interface AudioPreviewProps {
  audioUrl: string
  duration: number
  uploadState: UploadState
  uploadProgress: number
  uploadError: string | null
  transcription: string | null
  onDelete: () => void
  onSend: () => void
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function AudioPreview({
  audioUrl,
  duration,
  uploadState,
  uploadProgress,
  uploadError,
  transcription,
  onDelete,
  onSend,
}: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const isUploading = uploadState === 'uploading'
  const isSuccess = uploadState === 'success'
  const isDone = isSuccess

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onEnd = () => setIsPlaying(false)
    const onTime = () => setCurrentTime(el.currentTime)
    el.addEventListener('ended', onEnd)
    el.addEventListener('timeupdate', onTime)
    return () => {
      el.removeEventListener('ended', onEnd)
      el.removeEventListener('timeupdate', onTime)
    }
  }, [])

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
    } else {
      el.play()
      setIsPlaying(true)
    }
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col gap-4 animate-scale-in">
      <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />

      {/* Player */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-4 flex flex-col gap-3 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={isDone}
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
              'transition-all duration-[var(--duration-base)] active:scale-95',
              isDone
                ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                : 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-primary)] hover:bg-[var(--color-primary-dark)]',
            )}
          >
            {isDone ? (
              <CheckCircle2 size={22} />
            ) : isPlaying ? (
              <Pause size={22} />
            ) : (
              <Play size={22} className="ml-0.5" />
            )}
          </button>

          <div className="flex-1 flex flex-col gap-1.5">
            {/* Progress bar */}
            <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-100"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
              <span>{formatDuration(Math.floor(currentTime))}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">Enviando e transcrevendo…</span>
            <span className="text-[var(--color-primary)] font-medium">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Transcription result */}
      {isSuccess && transcription && (
        <div className="bg-violet-50 rounded-[var(--radius-xl)] p-3 border border-violet-100">
          <p className="text-xs font-medium text-[var(--color-primary)] mb-1">Transcrição (Groq Whisper)</p>
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
            {transcription}
          </p>
        </div>
      )}

      {isSuccess && !transcription && (
        <div className="bg-amber-50 rounded-[var(--radius-xl)] p-3 border border-amber-100">
          <p className="text-xs text-amber-700">Áudio salvo. Transcrição não disponível.</p>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-start gap-2 bg-[var(--color-error)]/8 rounded-[var(--radius-xl)] p-3">
          <AlertCircle size={16} className="text-[var(--color-error)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--color-error)]">{uploadError}</p>
        </div>
      )}

      {/* Actions */}
      {!isDone && (
        <div className="flex gap-3">
          <button
            onClick={onDelete}
            disabled={isUploading}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-[var(--radius-full)]',
              'border border-[var(--color-border)] text-[var(--color-text-secondary)]',
              'text-sm font-medium transition-all duration-[var(--duration-base)] active:scale-[0.98]',
              'hover:border-[var(--color-error)] hover:text-[var(--color-error)]',
              isUploading && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Trash2 size={16} />
            Excluir
          </button>

          <button
            onClick={onSend}
            disabled={isUploading}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-[var(--radius-full)]',
              'bg-[var(--color-primary)] text-white shadow-[var(--shadow-primary)]',
              'text-sm font-medium transition-all duration-[var(--duration-base)] active:scale-[0.98]',
              'hover:bg-[var(--color-primary-dark)]',
              isUploading && 'opacity-70 cursor-not-allowed',
            )}
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isUploading ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      )}

      {/* Success CTA */}
      {isSuccess && (
        <button
          onClick={onDelete}
          className="w-full py-3 rounded-[var(--radius-full)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors active:scale-[0.98]"
        >
          Gravar novo atendimento
        </button>
      )}
    </div>
  )
}
