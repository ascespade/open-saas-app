import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { SubscriptionStatus } from '@/src/payment/plans'

const getPaginatorArgsSchema = z.object({
  skipPages: z.number(),
  filter: z.object({
    emailContains: z.string().optional(),
    isAdmin: z.boolean().optional(),
    subscriptionStatusIn: z
      .array(z.nativeEnum(SubscriptionStatus).nullable())
      .optional(),
  }),
})

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

    const searchParams = request.nextUrl.searchParams
    const skipPages = parseInt(searchParams.get('skipPages') || '0')
    const emailContains = searchParams.get('emailContains') || ''
    const isAdmin = searchParams.get('isAdmin')
    const subscriptionStatusIn = searchParams.get('subscriptionStatusIn')

    const pageSize = 10

    // Build query
    let query = supabase
      .from('users')
      .select('id, email, username, subscription_status, payment_processor_user_id, is_admin', { count: 'exact' })
      .order('username', { ascending: true })

    if (emailContains) {
      query = query.ilike('email', `%${emailContains}%`)
    }

    if (isAdmin !== null && isAdmin !== '') {
      query = query.eq('is_admin', isAdmin === 'true')
    }

    if (subscriptionStatusIn) {
      const statuses = JSON.parse(subscriptionStatusIn) as (SubscriptionStatus | null)[]
      const includeUnsubscribed = statuses.some((s) => s === null)
      const desiredStatuses = statuses.filter((s) => s !== null) as SubscriptionStatus[]

      if (includeUnsubscribed && desiredStatuses.length > 0) {
        query = query.or(`subscription_status.in.(${desiredStatuses.join(',')}),subscription_status.is.null`)
      } else if (includeUnsubscribed) {
        query = query.is('subscription_status', null)
      } else if (desiredStatuses.length > 0) {
        query = query.in('subscription_status', desiredStatuses)
      }
    }

    // Apply pagination
    query = query.range(skipPages * pageSize, (skipPages + 1) * pageSize - 1)

    const { data: users, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / pageSize)

    return NextResponse.json({
      users: users || [],
      totalPages,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
