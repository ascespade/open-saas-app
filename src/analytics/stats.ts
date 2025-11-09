import { listOrders } from '@lemonsqueezy/lemonsqueezy.js'
import Stripe from 'stripe'
import type { DailyStats } from '@/types/database'
import { stripe } from '../payment/stripe/stripeClient'
import {
  getDailyPageViews,
  getSources,
} from './providers/plausibleAnalyticsUtils'
// import { getDailyPageViews, getSources } from './providers/googleAnalyticsUtils';
import { paymentProcessor } from '../payment/paymentProcessor'
import { SubscriptionStatus } from '../payment/plans'

export type DailyStatsProps = {
  dailyStats?: DailyStats
  weeklyStats?: DailyStats[]
  isLoading?: boolean
}

// This function will be called by a cron job or API route
export const calculateDailyStats = async (supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>) => {
  const nowUTC = new Date(Date.now())
  nowUTC.setUTCHours(0, 0, 0, 0)

  const yesterdayUTC = new Date(nowUTC)
  yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1)

  try {
    // Get yesterday's stats
    const { data: yesterdaysStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('date', yesterdayUTC.toISOString())
      .single()

    // Get user count
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get paid user count (active subscriptions only)
    const { count: paidUserCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', SubscriptionStatus.Active)

    let userDelta = userCount || 0
    let paidUserDelta = paidUserCount || 0
    if (yesterdaysStats) {
      userDelta = (userCount || 0) - yesterdaysStats.user_count
      paidUserDelta = (paidUserCount || 0) - yesterdaysStats.paid_user_count
    }

    // Get page views and sources from analytics provider
    const pageViews = await getDailyPageViews()
    const sources = await getSources()

    let prevDayViewsChangePercent = '0'
    if (yesterdaysStats && yesterdaysStats.total_views > 0) {
      const change =
        ((pageViews - yesterdaysStats.total_views) /
          yesterdaysStats.total_views) *
        100
      prevDayViewsChangePercent = change.toFixed(2)
    }

    // Calculate revenue from payment processor
    const { totalRevenue, totalProfit } = await calculateRevenue(supabase)

    // Create or update today's stats
    const { data: existingStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('date', nowUTC.toISOString())
      .single()

    const statsData = {
      date: nowUTC.toISOString(),
      total_views: pageViews,
      prev_day_views_change_percent: prevDayViewsChangePercent,
      user_count: userCount || 0,
      paid_user_count: paidUserCount || 0,
      user_delta: userDelta,
      paid_user_delta: paidUserDelta,
      total_revenue: totalRevenue,
      total_profit: totalProfit,
    }

    if (existingStats) {
      await supabase
        .from('daily_stats')
        .update(statsData)
        .eq('id', existingStats.id)
    } else {
      const { data: newStats } = await supabase
        .from('daily_stats')
        .insert(statsData)
        .select()
        .single()

      // Insert page view sources
      if (newStats && sources) {
        const sourcesData = sources.map((source) => ({
          date: nowUTC.toISOString(),
          name: source.name,
          visitors: source.visitors,
          daily_stats_id: newStats.id,
        }))

        await supabase.from('page_view_sources').insert(sourcesData)
      }
    }
  } catch (error) {
    console.error('Error calculating daily stats:', error)
    throw error
  }
}

async function calculateRevenue(supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>) {
  let totalRevenue = 0
  let totalProfit = 0

  try {
    // Calculate revenue from Stripe
    if (paymentProcessor.name === 'stripe') {
      const stripeOrders = await stripe.charges.list({
        limit: 100,
        created: {
          gte: Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000),
        },
      })

      totalRevenue = stripeOrders.data.reduce(
        (sum, charge) => sum + (charge.amount || 0) / 100,
        0,
      )
      totalProfit = totalRevenue * 0.9 // Assuming 10% fees
    }

    // Calculate revenue from Lemon Squeezy
    if (paymentProcessor.name === 'lemonsqueezy') {
      const orders = await listOrders({
        filter: {
          created_at: {
            gte: new Date().toISOString().split('T')[0],
          },
        },
      })

      totalRevenue = orders.data?.reduce(
        (sum, order) => sum + (parseFloat(order.attributes.total) || 0),
        0,
      ) || 0
      totalProfit = totalRevenue * 0.9 // Assuming 10% fees
    }
  } catch (error) {
    console.error('Error calculating revenue:', error)
  }

  return { totalRevenue, totalProfit }
}
