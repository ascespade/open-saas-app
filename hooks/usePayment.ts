'use client'

import { useState } from 'react'
import { PaymentPlanId } from '@/src/payment/plans'

interface CheckoutSession {
  sessionUrl: string | null
  sessionId: string
}

export function usePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCheckoutSession = async (
    paymentPlanId: PaymentPlanId
  ): Promise<CheckoutSession> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPlanId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getCustomerPortalUrl = async (): Promise<string> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/payment/customer-portal', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get customer portal URL')
      }

      const { url } = await response.json()
      return url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    generateCheckoutSession,
    getCustomerPortalUrl,
  }
}
