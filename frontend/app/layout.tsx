import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Toaster } from '@/components/ui/sonner'
import { RateLimitNotifier } from '@/components/rate-limit-notifier'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: '🔍 AdSpy',
  description: 'Self-hosted competitor ad intelligence platform',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white`}>
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </main>
        <Toaster />
        <RateLimitNotifier />
      </body>
    </html>
  )
}
