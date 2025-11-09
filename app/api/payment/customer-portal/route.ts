import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentProcessor } from '@/src/payment/paymentProcessor'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.email) {
      return NextResponse.json(
        { error: 'User needs an email to access customer portal' },
        { status: 403 }
      )
    }

    // Get customer portal URL using payment processor
    const portalUrl = await paymentProcessor.getCustomerPortalUrl({
      userId: user.id,
      userEmail: user.email,
      paymentProcessorUserId: user.payment_processor_user_id || undefined,
      // Pass Supabase client for user updates
      updateUser: async (userId: string, data: Record<string, unknown>) => {
        const { error } = await supabase
          .from('users')
          .update(data)
          .eq('id', userId)
        if (error) throw error
      },
    })

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error('Error getting customer portal URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
