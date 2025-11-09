import { paymentProcessor } from './paymentProcessor'
import { stripeWebhook } from './stripe/webhook'

export const paymentsWebhook = async (
  body: string,
  signature: string,
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>,
) => {
  // Convert to Express-like request format
  const request = {
    body: body,
    headers: {
      'stripe-signature': signature,
    },
  } as {
    body: string
    headers: { 'stripe-signature': string }
  }

  const response = {
    json: (data: unknown) => data,
    status: (code: number) => ({
      json: (data: unknown) => ({ status: code, data }),
    }),
  } as {
    json: (data: unknown) => unknown
    status: (code: number) => { json: (data: unknown) => { status: number; data: unknown } }
  }

  // Call the appropriate webhook handler based on payment processor
  if (paymentProcessor.id === 'stripe') {
    await stripeWebhook(request, response, { supabase })
  } else {
    // Handle Lemon Squeezy webhook if needed
    throw new Error('Lemon Squeezy webhook not implemented yet')
  }
}
