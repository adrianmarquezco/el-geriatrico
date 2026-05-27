import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'El Geriátrico — Gestiona tu residencia',
  description: 'El juego de gestión de residencias de mayores más divertido. Cuida a tus ancianos, amplía tu residencia y conviértete en el mejor cuidador.',
  manifest: '/manifest.json',
  themeColor: '#451a03',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'El Geriátrico',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  keywords: ['geriatrico', 'juego', 'residencia', 'mayores', 'gestión'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
