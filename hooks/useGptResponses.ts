'use client'

import { useState, useEffect } from 'react'
import type { GptResponse } from '@/types/database'

export function useGptResponses() {
  const [responses, setResponses] = useState<GptResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResponses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gpt-responses')
      if (!response.ok) {
        throw new Error('Failed to fetch GPT responses')
      }
      const data = await response.json()
      setResponses(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResponses()
  }, [])

  const generateResponse = async (hours: number) => {
    try {
      const response = await fetch('/api/gpt-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate GPT response')
      }
      const schedule = await response.json()
      // Refetch responses to get the new one
      await fetchResponses()
      return schedule
    } catch (err) {
      throw err
    }
  }

  return {
    responses,
    loading,
    error,
    generateResponse,
    refetch: fetchResponses,
  }
}
