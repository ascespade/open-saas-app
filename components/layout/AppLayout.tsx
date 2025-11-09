'use client'

import { usePathname } from 'next/navigation'
import { useMemo, useEffect } from 'react'
import NavBar from '@/src/client/components/NavBar/NavBar'
import {
  demoNavigationitems,
  marketingNavigationItems,
} from '@/src/client/components/NavBar/constants'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isMarketingPage = useMemo(() => {
    return pathname === '/' || pathname.startsWith('/pricing')
  }, [pathname])

  const navigationItems = isMarketingPage
    ? marketingNavigationItems
    : demoNavigationitems

  const shouldDisplayAppNavBar = useMemo(() => {
    return (
      pathname !== '/login' &&
      pathname !== '/signup' &&
      !pathname.startsWith('/admin')
    )
  }, [pathname])

  const isAdminDashboard = useMemo(() => {
    return pathname.startsWith('/admin')
  }, [pathname])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView()
      }
    }
  }, [pathname])

  if (isAdminDashboard) {
    return <>{children}</>
  }

  return (
    <>
      {shouldDisplayAppNavBar && (
        <NavBar navigationItems={navigationItems} />
      )}
      <div className="mx-auto max-w-screen-2xl">
        {children}
      </div>
    </>
  )
}
