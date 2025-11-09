'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { cn } from '@/src/lib/utils'
import DefaultLayout from '@/src/admin/layout/DefaultLayout'
import RevenueAndProfitChart from '@/src/admin/dashboards/analytics/RevenueAndProfitChart'
import SourcesTable from '@/src/admin/dashboards/analytics/SourcesTable'
import TotalPageViewsCard from '@/src/admin/dashboards/analytics/TotalPageViewsCard'
import TotalPayingUsersCard from '@/src/admin/dashboards/analytics/TotalPayingUsersCard'
import TotalRevenueCard from '@/src/admin/dashboards/analytics/TotalRevenueCard'
import TotalSignupsCard from '@/src/admin/dashboards/analytics/TotalSignupsCard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const { stats, loading: statsLoading, error } = useAnalytics()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return <div>Loading...</div>
  }

  if (!user.is_admin) {
    return null
  }

  if (error) {
    return (
      <DefaultLayout user={user}>
        <div className="flex h-full items-center justify-center">
          <div className="bg-card rounded-lg p-8 shadow-lg">
            <p className="text-2xl font-bold text-red-500">Error</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {error || 'Something went wrong while fetching stats.'}
            </p>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout user={user}>
      <div className="relative">
        <div
          className={cn({
            'opacity-25': !stats,
          })}
        >
          <div className="2xl:gap-7.5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
            <TotalPageViewsCard
              totalPageViews={stats?.dailyStats.total_views}
              prevDayViewsChangePercent={
                stats?.dailyStats.prev_day_views_change_percent
              }
            />
            <TotalRevenueCard
              dailyStats={stats?.dailyStats}
              weeklyStats={stats?.weeklyStats}
              isLoading={statsLoading}
            />
            <TotalPayingUsersCard
              dailyStats={stats?.dailyStats}
              isLoading={statsLoading}
            />
            <TotalSignupsCard
              dailyStats={stats?.dailyStats}
              isLoading={statsLoading}
            />
          </div>

          <div className="2xl:mt-7.5 2xl:gap-7.5 mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6">
            <RevenueAndProfitChart
              weeklyStats={stats?.weeklyStats}
              isLoading={statsLoading}
            />

            <div className="col-span-12 xl:col-span-8">
              <SourcesTable sources={stats?.dailyStats?.sources} />
            </div>
          </div>
        </div>

        {!stats && (
          <div className="bg-background/50 absolute inset-0 flex items-start justify-center">
            <div className="bg-card rounded-lg p-8 shadow-lg">
              <p className="text-foreground text-2xl font-bold">
                No daily stats generated yet
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Stats will appear here once the daily stats job has run
              </p>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  )
}

export default Dashboard
