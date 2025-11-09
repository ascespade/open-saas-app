import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentsWebhook } from '@/src/payment/webhook'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || 
                      request.headers.get('x-lemonsqueezy-signature') || 
                      ''

    if (!signature) {
      return NextResponse.json(
        { error: 'Webhook signature not provided' },
        { status: 400 }
      )
    }

    // Call the webhook handler
    await paymentsWebhook(body, signature, supabase)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    if (error instanceof Error && error.message.includes('Unhandled')) {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
