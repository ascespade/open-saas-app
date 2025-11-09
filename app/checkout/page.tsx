'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const ACCOUNT_PAGE_REDIRECT_DELAY_MS = 4000

export default function CheckoutResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get('status')

  useEffect(() => {
    const accountPageRedirectTimeoutId = setTimeout(() => {
      router.push('/account')
    }, ACCOUNT_PAGE_REDIRECT_DELAY_MS)

    return () => {
      clearTimeout(accountPageRedirectTimeoutId)
    }
  }, [router])

  if (status !== 'success' && status !== 'canceled') {
    router.push('/account')
    return null
  }

  return (
    <div className="mt-10 flex flex-col items-stretch sm:mx-6 sm:items-center">
      <div className="flex flex-col gap-4 px-4 py-8 text-center shadow-xl ring-1 ring-gray-900/10 sm:max-w-md sm:rounded-lg sm:px-10 dark:ring-gray-100/10">
        <h1 className="text-xl font-semibold">
          {status === 'success' && '🥳 Payment Successful!'}
          {status === 'canceled' && '😢 Payment Canceled.'}
        </h1>
        <span className="">
          You will be redirected to your account page in{' '}
          {ACCOUNT_PAGE_REDIRECT_DELAY_MS / 1000} seconds...
        </span>
      </div>
    </div>
  )
}
