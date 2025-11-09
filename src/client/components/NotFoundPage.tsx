'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export function NotFoundPage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold">404</h1>
        <p className="text-bodydark mb-8 text-lg">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          href={user ? '/demo-app' : '/'}
          className="text-accent-foreground bg-accent hover:bg-accent/90 inline-block rounded-lg px-8 py-3 font-semibold transition duration-300"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
