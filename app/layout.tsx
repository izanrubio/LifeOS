import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LifeOS',
  description: '¿Qué cabe hoy, de forma realista?',
  keywords: ['organización', 'día actual', 'tareas', 'minimalista'],
  authors: [{ name: 'LifeOS' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-background text-text antialiased">
        {children}
      </body>
    </html>
  )
}
