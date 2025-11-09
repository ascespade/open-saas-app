import express from 'express'
import type { Stripe } from 'stripe'
import { stripe } from './stripeClient'
import { requireNodeEnvVar } from '../../server/utils'
import { assertUnreachable } from '../../shared/utils'
import { UnhandledWebhookEventError } from '../errors'
import {
  PaymentPlanId,
  paymentPlans,
  SubscriptionStatus,
  type PaymentPlanEffect,
} from '../plans'
import { updateUserStripePaymentDetails } from './paymentDetails'
import {
  parseWebhookPayload,
  type InvoicePaidData,
  type SessionCompletedData,
  type SubscriptionDeletedData,
  type SubscriptionUpdatedData,
} from './webhookPayload'

export const stripeWebhook = async (
  request: express.Request,
  response: express.Response,
  context: { supabase: any },
) => {
  try {
    const rawStripeEvent = constructStripeEvent(request)
    const { eventName, data } = await parseWebhookPayload(rawStripeEvent)
    const supabase = context.supabase

    switch (eventName) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(data, supabase)
        break
      case 'invoice.paid':
        await handleInvoicePaid(data, supabase)
        break
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(data, supabase)
        break
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(data, supabase)
        break
      default:
        assertUnreachable(eventName)
    }
    return response.json({ received: true })
  } catch (err) {
    if (err instanceof UnhandledWebhookEventError) {
      console.error(err.message)
      return response.status(422).json({ error: err.message })
    }

    console.error('Webhook error:', err)
    return response
      .status(400)
      .json({ error: 'Error processing Stripe webhook event' })
  }
}

function constructStripeEvent(request: express.Request): Stripe.Event {
  try {
    const secret = requireNodeEnvVar('STRIPE_WEBHOOK_SECRET')
    const sig = request.headers['stripe-signature']
    if (!sig) {
      throw new Error('Stripe webhook signature not provided')
    }
    return stripe.webhooks.constructEvent(request.body, sig, secret)
  } catch (err) {
    throw new Error('Error constructing Stripe webhook event')
  }
}

async function handleCheckoutSessionCompleted(
  session: SessionCompletedData,
  supabase: any,
) {
  const isSuccessfulOneTimePayment =
    session.mode === 'payment' && session.payment_status === 'paid'
  if (isSuccessfulOneTimePayment) {
    await saveSuccessfulOneTimePayment(session, supabase)
  }
}

async function saveSuccessfulOneTimePayment(
  session: SessionCompletedData,
  supabase: any,
) {
  const userStripeId = session.customer
  const lineItems = await getCheckoutLineItemsBySessionId(session.id)
  const lineItemPriceId = extractPriceId(lineItems)
  const planId = getPlanIdByPriceId(lineItemPriceId)
  const plan = paymentPlans[planId]
  const { numOfCreditsPurchased } = getPlanEffectPaymentDetails({
    planId,
    planEffect: plan.effect,
  })
  return updateUserStripePaymentDetails(
    { userStripeId, numOfCreditsPurchased, datePaid: new Date() },
    supabase,
  )
}

async function handleInvoicePaid(
  invoice: InvoicePaidData,
  supabase: any,
) {
  await saveActiveSubscription(invoice, supabase)
}

async function saveActiveSubscription(
  invoice: InvoicePaidData,
  supabase: any,
) {
  const userStripeId = invoice.customer
  const datePaid = new Date(invoice.period_start * 1000)
  const priceId = extractPriceId(invoice.lines)
  const subscriptionPlan = getPlanIdByPriceId(priceId)
  return updateUserStripePaymentDetails(
    {
      userStripeId,
      datePaid,
      subscriptionPlan,
      subscriptionStatus: SubscriptionStatus.Active,
    },
    supabase,
  )
}

async function handleCustomerSubscriptionUpdated(
  subscription: SubscriptionUpdatedData,
  supabase: any,
) {
  const userStripeId = subscription.customer
  let subscriptionStatus: SubscriptionStatus | undefined
  const priceId = extractPriceId(subscription.items)
  const subscriptionPlan = getPlanIdByPriceId(priceId)

  if (subscription.status === SubscriptionStatus.Active) {
    subscriptionStatus = subscription.cancel_at_period_end
      ? SubscriptionStatus.CancelAtPeriodEnd
      : SubscriptionStatus.Active
  } else if (subscription.status === SubscriptionStatus.PastDue) {
    subscriptionStatus = SubscriptionStatus.PastDue
  }
  
  if (subscriptionStatus) {
    await updateUserStripePaymentDetails(
      { userStripeId, subscriptionPlan, subscriptionStatus },
      supabase,
    )
  }
}

async function handleCustomerSubscriptionDeleted(
  subscription: SubscriptionDeletedData,
  supabase: any,
) {
  const userStripeId = subscription.customer
  return updateUserStripePaymentDetails(
    { userStripeId, subscriptionStatus: SubscriptionStatus.Deleted },
    supabase,
  )
}

function extractPriceId(
  items:
    | Stripe.ApiList<Stripe.LineItem>
    | SubscriptionUpdatedData['items']
    | InvoicePaidData['lines'],
): string {
  if (items.data.length === 0) {
    throw new Error('No items in stripe event object')
  }
  if (items.data.length > 1) {
    throw new Error('More than one item in stripe event object')
  }
  const item = items.data[0]

  if ('price' in item && item.price?.id) {
    return item.price.id
  }

  if ('pricing' in item) {
    const priceId = item.pricing?.price_details?.price
    if (priceId) {
      return priceId
    }
  }
  throw new Error('Unable to extract price id from item')
}

async function getCheckoutLineItemsBySessionId(sessionId: string) {
  const { line_items } = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  })
  if (!line_items) {
    throw new Error('No line items found in checkout session')
  }
  return line_items
}

function getPlanIdByPriceId(priceId: string): PaymentPlanId {
  const planId = Object.values(PaymentPlanId).find(
    (planId) => paymentPlans[planId].getPaymentProcessorPlanId() === priceId,
  )
  if (!planId) {
    throw new Error(`No plan with Stripe price id ${priceId}`)
  }
  return planId
}

function getPlanEffectPaymentDetails({
  planId,
  planEffect,
}: {
  planId: PaymentPlanId
  planEffect: PaymentPlanEffect
}): {
  subscriptionPlan: PaymentPlanId | undefined
  numOfCreditsPurchased: number | undefined
} {
  switch (planEffect.kind) {
    case 'subscription':
      return { subscriptionPlan: planId, numOfCreditsPurchased: undefined }
    case 'credits':
      return {
        subscriptionPlan: undefined,
        numOfCreditsPurchased: planEffect.amount,
      }
    default:
      assertUnreachable(planEffect)
  }
}
