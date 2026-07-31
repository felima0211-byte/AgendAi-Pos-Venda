import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'AgendAI — Seu assistente pessoal de vendas',
  description: 'Gerencie clientes, vendas e lembretes com inteligência artificial.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgendAI',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${inter.className} h-full bg-[var(--color-background)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
