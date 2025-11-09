import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentProcessor } from '@/src/payment/paymentProcessor'
import { PaymentPlanId, paymentPlans } from '@/src/payment/plans'
import { z } from 'zod'

const generateCheckoutSessionSchema = z.nativeEnum(PaymentPlanId)

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
        { error: 'User needs an email to make a payment' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const paymentPlanId = generateCheckoutSessionSchema.parse(body.paymentPlanId)

    const paymentPlan = paymentPlans[paymentPlanId]

    // Create checkout session using payment processor
    const { session } = await paymentProcessor.createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      paymentPlan,
      // Pass Supabase client for user updates
      updateUser: async (userId: string, data: any) => {
        const { error } = await supabase
          .from('users')
          .update(data)
          .eq('id', userId)
        if (error) throw error
      },
    })

    return NextResponse.json({
      sessionUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
