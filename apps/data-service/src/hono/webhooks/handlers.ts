/**
 * Polar Webhook Event Handlers
 *
 * Processes different webhook events from Polar and updates the database accordingly.
 */

import type {
  BillingReason,
  SubscriptionStatus,
} from '@kurama/data-ops/drizzle/schema'
import { initDatabase } from '@kurama/data-ops/database/setup'
import {
  createOrder,
  markOrderPaid,
  markOrderRefunded,
} from '@kurama/data-ops/queries/orders'
import { processReferralReward } from '@kurama/data-ops/queries/referrals'
import {
  updateSubscriptionStatus,
  updateUserSubscriptionTier,
  upsertSubscription,
} from '@kurama/data-ops/queries/subscriptions'

// Database connection config type
interface DbConfig {
  host: string
  username: string
  password: string
}

// Metadata type for our database
type SafeMetadata = Record<string, string | number | boolean | null>

// Polar webhook payload types (simplified)
interface PolarSubscriptionData {
  id: string
  product_id: string
  price_id?: string
  status: string
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  canceled_at?: string
  trial_start?: string
  trial_end?: string
  customer_id?: string
  metadata?: Record<string, unknown>
}

interface PolarOrderData {
  id: string
  product_id: string
  subscription_id?: string
  amount: number
  currency: string
  status: string
  checkout_id?: string
  billing_reason?: string
  customer_id?: string
  metadata?: Record<string, unknown>
}

/**
 * Convert Polar metadata to our safe metadata type
 */
function toSafeMetadata(metadata?: Record<string, unknown>): SafeMetadata | undefined {
  if (!metadata)
    return undefined

  const safe: SafeMetadata = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (
      typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
      || value === null
    ) {
      safe[key] = value
    }
    else {
      // Convert other types to string
      safe[key] = String(value)
    }
  }
  return safe
}

interface PolarWebhookPayload {
  type: string
  data: PolarSubscriptionData | PolarOrderData | Record<string, unknown>
}

/**
 * Main webhook event handler
 */
export async function handleWebhookEvent(
  payload: PolarWebhookPayload,
  dbConfig: DbConfig,
): Promise<void> {
  // Initialize database
  initDatabase(dbConfig)

  console.warn(`Processing webhook event: ${payload.type}`)

  switch (payload.type) {
    // Subscription events
    case 'subscription.created':
    case 'subscription.updated':
    case 'subscription.active':
      await handleSubscriptionUpdate(payload.data as PolarSubscriptionData)
      break

    case 'subscription.canceled':
    case 'subscription.revoked':
      await handleSubscriptionCanceled(payload.data as PolarSubscriptionData)
      break

    case 'subscription.uncanceled':
      await handleSubscriptionUncanceled(payload.data as PolarSubscriptionData)
      break

    // Order events
    case 'order.created':
      await handleOrderCreated(payload.data as PolarOrderData)
      break

    case 'order.paid':
      await handleOrderPaid(payload.data as PolarOrderData)
      break

    case 'order.refunded':
      await handleOrderRefunded(payload.data as PolarOrderData)
      break

    // Checkout events (logging only)
    case 'checkout.created':
    case 'checkout.updated':
      console.warn(`Checkout event: ${payload.type}`, (payload.data as Record<string, unknown>).id)
      break

    // Customer events (logging only)
    case 'customer.created':
    case 'customer.updated':
    case 'customer.deleted':
    case 'customer.state_changed':
      console.warn(`Customer event: ${payload.type}`, (payload.data as Record<string, unknown>).id)
      break

    default:
      console.warn(`Unhandled webhook event type: ${payload.type}`)
  }
}

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionUpdate(data: PolarSubscriptionData): Promise<void> {
  // Extract user ID from metadata or customer_id
  const userId = extractUserId(data)

  if (!userId) {
    console.error('No user ID found in subscription data:', data.id)
    return
  }

  // Map Polar status to our status type
  const status = mapSubscriptionStatus(data.status)

  // Upsert subscription record
  await upsertSubscription({
    id: data.id,
    userId,
    productId: data.product_id,
    priceId: data.price_id,
    status,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    trialStart: data.trial_start,
    trialEnd: data.trial_end,
    metadata: toSafeMetadata(data.metadata),
  })

  // Update user profile subscription tier if subscription is active
  if (status === 'active' || status === 'trialing') {
    await updateUserSubscriptionTier(
      userId,
      data.product_id,
      data.current_period_end,
    )
  }

  console.warn(`Subscription ${data.id} updated for user ${userId} with status ${status}`)
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(data: PolarSubscriptionData): Promise<void> {
  const userId = extractUserId(data)

  await updateSubscriptionStatus(data.id, 'canceled', {
    canceledAt: data.canceled_at ?? new Date().toISOString(),
    cancelAtPeriodEnd: true,
  })

  // Note: Don't downgrade immediately - user keeps access until period ends
  // A scheduled job should handle downgrade based on currentPeriodEnd
  console.warn(`Subscription ${data.id} canceled. User ${userId} keeps access until period end.`)
}

/**
 * Handle subscription uncancellation (user reactivated)
 */
async function handleSubscriptionUncanceled(data: PolarSubscriptionData): Promise<void> {
  const status = mapSubscriptionStatus(data.status)

  await updateSubscriptionStatus(data.id, status, {
    canceledAt: undefined,
    cancelAtPeriodEnd: false,
  })

  console.warn(`Subscription ${data.id} uncanceled`)
}

/**
 * Handle order creation
 */
async function handleOrderCreated(data: PolarOrderData): Promise<void> {
  const userId = extractUserId(data)

  if (!userId) {
    console.error('No user ID found in order data:', data.id)
    return
  }

  await createOrder({
    id: data.id,
    userId,
    subscriptionId: data.subscription_id,
    productId: data.product_id,
    amount: data.amount,
    currency: data.currency || 'usd',
    status: 'pending',
    checkoutId: data.checkout_id,
    billingReason: mapBillingReason(data.billing_reason),
    metadata: toSafeMetadata(data.metadata),
  })

  console.warn(`Order ${data.id} created for user ${userId}`)
}

/**
 * Handle order paid
 */
async function handleOrderPaid(data: PolarOrderData): Promise<void> {
  const userId = extractUserId(data)

  // First, try to update existing order
  const updated = await markOrderPaid(data.id)

  // If order doesn't exist, create it
  if (!updated && userId) {
    await createOrder({
      id: data.id,
      userId,
      subscriptionId: data.subscription_id,
      productId: data.product_id,
      amount: data.amount,
      currency: data.currency || 'usd',
      status: 'paid',
      checkoutId: data.checkout_id,
      billingReason: mapBillingReason(data.billing_reason),
      paidAt: new Date().toISOString(),
      metadata: toSafeMetadata(data.metadata),
    })
  }

  // Process referral reward if this is the user's first order
  if (userId) {
    try {
      await processReferralReward(userId)
    }
    catch (error) {
      console.error('Error processing referral reward:', error)
    }
  }

  console.warn(`Order ${data.id} marked as paid`)
}

/**
 * Handle order refunded
 */
async function handleOrderRefunded(data: PolarOrderData): Promise<void> {
  await markOrderRefunded(data.id)

  // If this was a subscription order, we might need to handle subscription status
  // This depends on business logic - partial refunds vs full refunds

  console.warn(`Order ${data.id} refunded`)
}

/**
 * Extract user ID from webhook data
 * Polar sends user ID in metadata.userId or as external_customer_id
 */
function extractUserId(data: PolarSubscriptionData | PolarOrderData): string | null {
  // Check metadata first
  if (data.metadata?.userId && typeof data.metadata.userId === 'string') {
    return data.metadata.userId
  }

  // Check external_customer_id (set during checkout)
  if ('external_customer_id' in data && typeof data.external_customer_id === 'string') {
    return data.external_customer_id
  }

  // Check customer_id as fallback
  if (data.customer_id) {
    return data.customer_id
  }

  return null
}

/**
 * Map Polar subscription status to our status type
 */
function mapSubscriptionStatus(polarStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    paused: 'paused',
  }

  return statusMap[polarStatus] || 'incomplete'
}

/**
 * Map Polar billing reason to our type
 */
function mapBillingReason(polarReason?: string): BillingReason | undefined {
  if (!polarReason)
    return undefined

  const reasonMap: Record<string, BillingReason> = {
    purchase: 'purchase',
    subscription_create: 'subscription_create',
    subscription_cycle: 'subscription_cycle',
    subscription_update: 'subscription_update',
  }

  return reasonMap[polarReason]
}
