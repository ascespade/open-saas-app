'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

export const useIsLandingPage = () => {
  const pathname = usePathname()

  return useMemo(() => {
    return pathname === '/'
  }, [pathname])
}
