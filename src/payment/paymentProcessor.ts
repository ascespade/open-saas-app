import type { PaymentPlan } from './plans'
import { stripePaymentProcessor } from './stripe/paymentProcessor'

export interface CreateCheckoutSessionArgs {
  userId: string
  userEmail: string
  paymentPlan: PaymentPlan
  updateUser: (userId: string, data: Record<string, unknown>) => Promise<void>
}

export interface FetchCustomerPortalUrlArgs {
  userId: string
  userEmail: string
  paymentProcessorUserId?: string
  updateUser: (userId: string, data: Record<string, unknown>) => Promise<void>
}

export interface PaymentProcessor {
  id: 'stripe' | 'lemonsqueezy'
  name: 'stripe' | 'lemonsqueezy'
  createCheckoutSession: (
    args: CreateCheckoutSessionArgs,
  ) => Promise<{ session: { id: string; url: string } }>
  getCustomerPortalUrl: (
    args: FetchCustomerPortalUrlArgs,
  ) => Promise<string | null>
}

/**
 * Choose which payment processor you'd like to use, then delete the
 * other payment processor code that you're not using  from `/src/payment`
 */
// export const paymentProcessor: PaymentProcessor = lemonSqueezyPaymentProcessor;
export const paymentProcessor: PaymentProcessor = stripePaymentProcessor
