import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const loadingVariants = cva('flex items-center justify-center', {
  variants: {
    size: {
      sm: 'gap-1.5',
      md: 'gap-2',
      lg: 'gap-3',
    },
    fullScreen: {
      true: 'fixed inset-0 z-[400] bg-[var(--color-background)]/80 backdrop-blur-sm',
    },
    inline: {
      true: 'inline-flex',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const iconSizeMap = { sm: 16, md: 20, lg: 28 }
const textSizeMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

interface LoadingProps extends VariantProps<typeof loadingVariants> {
  label?: string
  className?: string
}

function Loading({ size = 'md', fullScreen, inline, label, className }: LoadingProps) {
  return (
    <div className={cn(loadingVariants({ size, fullScreen, inline }), className)}>
      <Loader2
        size={iconSizeMap[size ?? 'md']}
        className="animate-spin text-[var(--color-primary)]"
      />
      {label && (
        <span className={cn(textSizeMap[size ?? 'md'], 'text-[var(--color-text-secondary)]')}>
          {label}
        </span>
      )}
    </div>
  )
}

function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{ width: 160, height: 160, objectFit: 'contain', mixBlendMode: 'multiply' }}
      >
        <source src="/loading.mp4" type="video/mp4" />
      </video>
    </div>
  )
}

export { Loading, LoadingPage }
