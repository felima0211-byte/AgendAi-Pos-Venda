import { cn } from '@/lib/utils'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showTopBar?: boolean
  showBottomNav?: boolean
  showSidebar?: boolean
  showSearch?: boolean
  showNotification?: boolean
  topBarRight?: React.ReactNode
  className?: string
  contentClassName?: string
}

export function MainLayout({
  children,
  title,
  subtitle,
  showTopBar = true,
  showBottomNav = true,
  showSidebar = true,
  showSearch = false,
  showNotification = true,
  topBarRight,
  className,
  contentClassName,
}: MainLayoutProps) {
  return (
    <div className={cn('flex h-full min-h-dvh bg-[var(--color-background)]', className)}>
      {showSidebar && <Sidebar />}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {showTopBar && (
          <TopBar
            title={title}
            subtitle={subtitle}
            showSearch={showSearch}
            showNotification={showNotification}
            rightSlot={topBarRight}
          />
        )}

        <main
          className={cn(
            'flex-1 overflow-y-auto',
            showBottomNav && 'pb-20',
            contentClassName,
          )}
        >
          {children}
        </main>

        {showBottomNav && <BottomNav />}
      </div>
    </div>
  )
}
