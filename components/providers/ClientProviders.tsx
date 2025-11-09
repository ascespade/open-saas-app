'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/src/components/ui/toaster'
import CookieConsentBanner from '@/src/client/components/cookie-consent/Banner'
import { AppLayout } from '@/components/layout/AppLayout'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayout>
        {children}
      </AppLayout>
      <Toaster />
      <CookieConsentBanner />
    </AuthProvider>
  )
}

