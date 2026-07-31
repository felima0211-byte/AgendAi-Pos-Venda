import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

const avatarVariants = cva(
  'relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none',
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
        '2xl': 'w-20 h-20 text-xl',
      },
      shape: {
        circle: 'rounded-full',
        rounded: 'rounded-[var(--radius-lg)]',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  },
)

const COLORS = [
  ['#6D3CF6', '#EDE9FE'],
  ['#FF8A3D', '#FFF3E8'],
  ['#38B26D', '#E6F7EE'],
  ['#8B5CF6', '#EDE9FE'],
  ['#EF4444', '#FEE2E2'],
  ['#F59E0B', '#FEF3C7'],
]

function getInitialColor(name: string) {
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  name?: string
  className?: string
  online?: boolean
}

function Avatar({ src, alt, name, size, shape, className, online }: AvatarProps) {
  const [color, bg] = name ? getInitialColor(name) : ['#6D3CF6', '#EDE9FE']

  return (
    <span className={cn(avatarVariants({ size, shape }), className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : name ? (
        <span
          className="w-full h-full flex items-center justify-center font-semibold"
          style={{ backgroundColor: bg, color }}
        >
          {getInitials(name)}
        </span>
      ) : (
        <span className="w-full h-full flex items-center justify-center bg-[var(--color-border)] text-[var(--color-text-tertiary)]">
          <User size={12} />
        </span>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-surface)]',
            online ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-tertiary)]',
          )}
        />
      )}
    </span>
  )
}

export { Avatar, avatarVariants }
