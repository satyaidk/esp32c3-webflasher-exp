import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SmartClock - IoT Smart Clock Platform',
  description: 'Flash firmware, control brightness & theme, and manage over-the-air updates for your ESP32-powered smart clock with ease.',
  generator: 'v0.app',
  keywords: 'ESP32, IoT, smart clock, firmware flasher, OTA updates, web-based control',
  authors: [{ name: 'SmartClock Team' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://smartclock.local',
    title: 'SmartClock - IoT Smart Clock Platform',
    description: 'Complete platform for managing your ESP32-powered smart clock',
    images: [
      {
        url: 'https://smartclock.local/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
