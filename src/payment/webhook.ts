import { paymentProcessor } from './paymentProcessor'
import { stripeWebhook } from './stripe/webhook'

export const paymentsWebhook = async (
  body: string,
  signature: string,
  supabase: any,
) => {
  // Convert to Express-like request format
  const request = {
    body: body,
    headers: {
      'stripe-signature': signature,
    },
  } as any

  const response = {
    json: (data: any) => data,
    status: (code: number) => ({
      json: (data: any) => ({ status: code, data }),
    }),
  } as any

  // Call the appropriate webhook handler based on payment processor
  if (paymentProcessor.id === 'stripe') {
    await stripeWebhook(request, response, { supabase })
  } else {
    // Handle Lemon Squeezy webhook if needed
    throw new Error('Lemon Squeezy webhook not implemented yet')
  }
}
