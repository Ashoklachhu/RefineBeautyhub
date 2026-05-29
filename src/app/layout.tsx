import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter, Playfair_Display } from 'next/font/google'
import { Providers } from '@/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Refined Beauty Hub | Luxury Salon & Academy — Kathmandu',
    template: '%s | Refined Beauty Hub',
  },
  description:
    'Experience luxury beauty services and world-class beauty education at Refined Beauty Hub, Kathmandu\'s premier salon and academy. Hair, skin, nails, makeup & professional courses.',
  keywords: [
    'luxury salon Kathmandu',
    'beauty academy Nepal',
    'hair salon Kathmandu',
    'makeup artist Nepal',
    'beauty courses Kathmandu',
    'bridal makeup Nepal',
    'Refined Beauty Hub',
  ],
  authors: [{ name: 'Refined Beauty Hub' }],
  creator: 'Refined Beauty Hub',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_NP',
    siteName: 'Refined Beauty Hub',
    title: 'Refined Beauty Hub | Luxury Salon & Academy',
    description: 'Premium beauty salon and academy in Kathmandu, Nepal.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refined Beauty Hub | Luxury Salon & Academy',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1a17' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${playfair.variable} h-full antialiased overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
