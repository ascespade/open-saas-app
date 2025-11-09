'use client'

import { useState, useEffect } from 'react'

interface DailyStatsWithSources {
  id: number
  date: string
  total_views: number
  prev_day_views_change_percent: string
  user_count: number
  paid_user_count: number
  user_delta: number
  paid_user_delta: number
  total_revenue: number
  total_profit: number
  sources: Array<{
    date: string
    name: string
    daily_stats_id: number | null
    visitors: number
  }>
}

interface AnalyticsStats {
  dailyStats: DailyStatsWithSources
  weeklyStats: DailyStatsWithSources[]
}

export function useAnalytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics stats')
      }
      const data = await response.json()
      if (data.message) {
        // No stats generated yet
        setStats(null)
      } else {
        setStats(data)
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
