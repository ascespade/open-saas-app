'use client'

import { useState } from 'react'
import type { User } from '@/types/database'
import { SubscriptionStatus } from '@/src/payment/plans'

interface GetPaginatedUsersParams {
  skipPages: number
  filter: {
    emailContains?: string
    isAdmin?: boolean
    subscriptionStatusIn?: (SubscriptionStatus | null)[]
  }
}

interface GetPaginatedUsersOutput {
  users: Pick<
    User,
    | 'id'
    | 'email'
    | 'username'
    | 'subscription_status'
    | 'payment_processor_user_id'
    | 'is_admin'
  >[]
  totalPages: number
}

export function useUsers() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPaginatedUsers = async (
    params: GetPaginatedUsersParams
  ): Promise<GetPaginatedUsersOutput> => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams({
        skipPages: params.skipPages.toString(),
        emailContains: params.filter.emailContains || '',
        ...(params.filter.isAdmin !== undefined && {
          isAdmin: params.filter.isAdmin.toString(),
        }),
        ...(params.filter.subscriptionStatusIn && {
          subscriptionStatusIn: JSON.stringify(params.filter.subscriptionStatusIn),
        }),
      })

      const response = await fetch(`/api/users?${searchParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
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

  const updateIsUserAdminById = async (id: string, isAdmin: boolean) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
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

  return {
    loading,
    error,
    getPaginatedUsers,
    updateIsUserAdminById,
  }
}
