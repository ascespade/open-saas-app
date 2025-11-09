import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', authUser.id)
      .single()

    if (userError || !user || !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get daily stats with sources
    const { data: dailyStats, error: dailyError } = await supabase
      .from('daily_stats')
      .select(`
        *,
        sources:page_view_sources(*)
      `)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (dailyError && dailyError.code !== 'PGRST116') {
      return NextResponse.json({ error: dailyError.message }, { status: 500 })
    }

    // Get weekly stats
    const { data: weeklyStats, error: weeklyError } = await supabase
      .from('daily_stats')
      .select(`
        *,
        sources:page_view_sources(*)
      `)
      .order('date', { ascending: false })
      .limit(7)

    if (weeklyError) {
      return NextResponse.json({ error: weeklyError.message }, { status: 500 })
    }

    if (!dailyStats) {
      return NextResponse.json({
        message: 'No daily stats have been generated yet',
      })
    }

    return NextResponse.json({
      dailyStats,
      weeklyStats: weeklyStats || [],
    })
  } catch (error) {
    console.error('Error fetching analytics stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
