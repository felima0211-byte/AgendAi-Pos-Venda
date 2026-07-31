'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Loader2 } from 'lucide-react'

const floatingAudioVariants = cva(
  [
    'flex items-center justify-center rounded-full',
    'shadow-[var(--shadow-xl)]',
    'transition-all duration-[var(--duration-base)]',
    'active:scale-95 select-none cursor-pointer',
    'outline-none',
  ],
  {
    variants: {
      state: {
        idle: 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white',
        recording: 'bg-[var(--color-error)] text-white animate-pulse-soft',
        processing: 'bg-[var(--color-accent)] text-white',
        disabled: 'bg-[var(--color-border)] text-[var(--color-text-tertiary)] cursor-not-allowed',
      },
      size: {
        md: 'w-14 h-14',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20',
      },
    },
    defaultVariants: {
      state: 'idle',
      size: 'lg',
    },
  },
)

type AudioState = 'idle' | 'recording' | 'processing' | 'disabled'

interface FloatingAudioButtonProps extends VariantProps<typeof floatingAudioVariants> {
  audioState?: AudioState
  onPress?: () => void
  className?: string
  position?: 'bottom-right' | 'bottom-center' | 'static'
}

function FloatingAudioButton({
  audioState = 'idle',
  size,
  onPress,
  className,
  position = 'bottom-right',
}: FloatingAudioButtonProps) {
  const Icon =
    audioState === 'processing' ? Loader2 : audioState === 'recording' ? MicOff : Mic

  return (
    <button
      onClick={onPress}
      disabled={audioState === 'disabled'}
      aria-label={
        audioState === 'idle'
          ? 'Gravar áudio'
          : audioState === 'recording'
            ? 'Parar gravação'
            : 'Processando...'
      }
      className={cn(
        floatingAudioVariants({ state: audioState, size }),
        position === 'bottom-right' && 'fixed bottom-24 right-4 z-[300]',
        position === 'bottom-center' && 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[300]',
        className,
      )}
    >
      <Icon
        size={size === 'xl' ? 28 : size === 'md' ? 20 : 24}
        className={audioState === 'processing' ? 'animate-spin' : undefined}
      />
      {audioState === 'recording' && (
        <span className="absolute inset-0 rounded-full bg-[var(--color-error)]/30 animate-ping" />
      )}
    </button>
  )
}

export { FloatingAudioButton }
