import { NextRequest, NextResponse } from 'next/server'
import { paymentsWebhook } from '@/src/payment/webhook'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || 
                      request.headers.get('x-lemonsqueezy-signature') || 
                      ''

    // Call the webhook handler
    await paymentsWebhook({
      body,
      signature,
      // Pass Supabase client for database operations
      supabase,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
