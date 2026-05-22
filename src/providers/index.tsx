'use client'

import { ThemeProvider } from './ThemeProvider'
import { AuthProvider } from './AuthProvider'
import { CartProvider } from './CartProvider'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rbh-theme">
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster position="top-right" richColors />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
