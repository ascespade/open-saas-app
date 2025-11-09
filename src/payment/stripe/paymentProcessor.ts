import { requireNodeEnvVar } from '../../server/utils'
import type {
  CreateCheckoutSessionArgs,
  FetchCustomerPortalUrlArgs,
  PaymentProcessor,
} from '../paymentProcessor'
import type { PaymentPlanEffect } from '../plans'
import {
  createStripeCheckoutSession,
  fetchStripeCustomer,
} from './checkoutUtils'
import { stripe } from './stripeClient'

export type StripeMode = 'subscription' | 'payment'

export const stripePaymentProcessor: PaymentProcessor = {
  id: 'stripe',
  name: 'stripe',
  createCheckoutSession: async ({
    userId,
    userEmail,
    paymentPlan,
    updateUser,
  }: CreateCheckoutSessionArgs) => {
    const customer = await fetchStripeCustomer(userEmail)
    const stripeSession = await createStripeCheckoutSession({
      priceId: paymentPlan.getPaymentProcessorPlanId(),
      customerId: customer.id,
      mode: paymentPlanEffectToStripeMode(paymentPlan.effect),
    })
    
    await updateUser(userId, {
      payment_processor_user_id: customer.id,
    })
    
    if (!stripeSession.url)
      throw new Error('Error creating Stripe Checkout Session')
    const session = {
      url: stripeSession.url,
      id: stripeSession.id,
    }
    return { session }
  },
  getCustomerPortalUrl: async ({
    paymentProcessorUserId,
  }: FetchCustomerPortalUrlArgs) => {
    if (!paymentProcessorUserId) {
      return null
    }
    // For Stripe, we can use the customer portal URL from environment variable
    // or create a session dynamically
    const portalUrl = process.env.STRIPE_CUSTOMER_PORTAL_URL
    if (portalUrl) {
      return portalUrl
    }
    // Alternatively, create a portal session dynamically
    const session = await stripe.billingPortal.sessions.create({
      customer: paymentProcessorUserId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
    })
    return session.url
  },
}

function paymentPlanEffectToStripeMode(
  planEffect: PaymentPlanEffect,
): StripeMode {
  const effectToMode: Record<PaymentPlanEffect['kind'], StripeMode> = {
    subscription: 'subscription',
    credits: 'payment',
  }
  return effectToMode[planEffect.kind]
}
