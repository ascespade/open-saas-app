import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for webhook processing
    const body = await request.text()
    let payload: any

    // Try to parse JSON body
    try {
      payload = JSON.parse(body)
    } catch {
      // If not JSON, return the raw body
      payload = body
    }

    // Log the webhook for debugging
    console.log('Webhook received:', {
      headers: Object.fromEntries(request.headers.entries()),
      payload: typeof payload === 'string' ? payload.substring(0, 200) : payload,
    })

    // Store webhook data in database (optional - for logging/auditing)
    try {
      const supabase = createAdminClient()
      const { error: logError } = await supabase
        .from('logs')
        .insert({
          message: `Webhook received: ${JSON.stringify(payload).substring(0, 500)}`,
          level: 'info',
        })

      if (logError) {
        console.error('Error logging webhook:', logError)
      }
    } catch (logErr) {
      // Don't fail the webhook if logging fails
      console.error('Failed to log webhook:', logErr)
    }

    // Process the webhook payload
    // You can add custom logic here based on your n8n webhook requirements
    const response = {
      received: true,
      timestamp: new Date().toISOString(),
      payload: payload,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Support GET requests for webhook testing/verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    endpoint: '/api/webhook/webhook',
    timestamp: new Date().toISOString(),
  })
}

