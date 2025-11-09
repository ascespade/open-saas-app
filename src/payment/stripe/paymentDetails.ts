import type { SubscriptionStatus } from '../plans'
import { PaymentPlanId } from '../plans'
import type { User } from '@/types/database'

export const updateUserStripePaymentDetails = async (
  {
    userStripeId,
    subscriptionPlan,
    subscriptionStatus,
    datePaid,
    numOfCreditsPurchased,
  }: {
    userStripeId: string
    subscriptionPlan?: PaymentPlanId
    subscriptionStatus?: SubscriptionStatus
    numOfCreditsPurchased?: number
    datePaid?: Date
  },
  supabase: any,
): Promise<User> => {
  // First, find the user by payment processor user ID
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('payment_processor_user_id', userStripeId)
    .single()

  if (findError || !user) {
    throw new Error(`User not found with Stripe ID: ${userStripeId}`)
  }

  // Prepare update data
  const updateData: any = {
    payment_processor_user_id: userStripeId,
  }

  if (subscriptionPlan !== undefined) {
    updateData.subscription_plan = subscriptionPlan
  }

  if (subscriptionStatus !== undefined) {
    updateData.subscription_status = subscriptionStatus
  }

  if (datePaid !== undefined) {
    updateData.date_paid = datePaid.toISOString()
  }

  if (numOfCreditsPurchased !== undefined) {
    updateData.credits = (user.credits || 0) + numOfCreditsPurchased
  }

  // Update the user
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Error updating user: ${updateError.message}`)
  }

  return updatedUser
}
