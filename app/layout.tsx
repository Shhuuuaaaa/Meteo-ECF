import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/providers/QueryProvider'
import { WeatherBackground } from '@/components/WeatherBackground'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Météo — Prévisions en temps réel',
  description: 'Application météo moderne avec design glassmorphism animé',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Météo',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-gray-950">
        <QueryProvider>
          <WeatherBackground />
          {children}
        </QueryProvider>

        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          offset={20}
          gap={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: 'rgba(9, 9, 11, 0.88)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: '#f8fafc',
              boxShadow: '0 20px 40px -12px rgba(0,0,0,0.6)',
              fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
            },
          }}
        />
      </body>
    </html>
  )
}
