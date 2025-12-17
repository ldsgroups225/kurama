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

// Polar customer object (nested in subscription/order data)
// Supports both snake_case (raw webhook) and camelCase (SDK transformed)
interface PolarCustomer {
  id: string
  externalId?: string | null
  external_id?: string | null
  email?: string
  name?: string | null
  metadata?: Record<string, unknown>
}

// Polar webhook payload types
// Supports both snake_case (raw webhook) and camelCase (SDK transformed)
interface PolarSubscriptionData {
  id: string
  // camelCase (SDK)
  productId?: string
  priceId?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  canceledAt?: string
  trialStart?: string
  trialEnd?: string
  customerId?: string
  // snake_case (raw webhook)
  product_id?: string
  price_id?: string
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  canceled_at?: string
  trial_start?: string
  trial_end?: string
  customer_id?: string
  // Common
  status: string
  customer?: PolarCustomer
  metadata?: Record<string, unknown>
}

interface PolarOrderData {
  id: string
  // camelCase (SDK)
  productId?: string
  subscriptionId?: string
  totalAmount?: number
  netAmount?: number
  subtotalAmount?: number
  checkoutId?: string
  billingReason?: string
  customerId?: string
  // snake_case (raw webhook)
  product_id?: string
  subscription_id?: string
  total_amount?: number
  net_amount?: number
  subtotal_amount?: number
  checkout_id?: string
  billing_reason?: string
  customer_id?: string
  // Common
  amount?: number
  currency: string
  status: string
  customer?: PolarCustomer
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

  // Log full payload for debugging (remove in production if too verbose)
  console.warn('Webhook payload data:', JSON.stringify(payload.data, null, 2))

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

// Helper functions to get values from either camelCase or snake_case
function getProductId(data: PolarSubscriptionData | PolarOrderData): string {
  return data.productId ?? data.product_id ?? ''
}

function getPriceId(data: PolarSubscriptionData): string | undefined {
  return data.priceId ?? data.price_id
}

function getSubscriptionId(data: PolarOrderData): string | undefined {
  return data.subscriptionId ?? data.subscription_id
}

function getCurrentPeriodStart(data: PolarSubscriptionData): string | undefined {
  return data.currentPeriodStart ?? data.current_period_start
}

function getCurrentPeriodEnd(data: PolarSubscriptionData): string | undefined {
  return data.currentPeriodEnd ?? data.current_period_end
}

function getCancelAtPeriodEnd(data: PolarSubscriptionData): boolean {
  return data.cancelAtPeriodEnd ?? data.cancel_at_period_end ?? false
}

function getCanceledAt(data: PolarSubscriptionData): string | undefined {
  return data.canceledAt ?? data.canceled_at
}

function getTrialStart(data: PolarSubscriptionData): string | undefined {
  return data.trialStart ?? data.trial_start
}

function getTrialEnd(data: PolarSubscriptionData): string | undefined {
  return data.trialEnd ?? data.trial_end
}

function getCheckoutId(data: PolarOrderData): string | undefined {
  return data.checkoutId ?? data.checkout_id
}

function getBillingReason(data: PolarOrderData): string | undefined {
  return data.billingReason ?? data.billing_reason
}

function getCustomerExternalId(customer?: PolarCustomer): string | null {
  if (!customer)
    return null
  return customer.externalId ?? customer.external_id ?? null
}

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionUpdate(data: PolarSubscriptionData): Promise<void> {
  // Extract user ID from metadata or customerId
  const userId = extractUserId(data)

  if (!userId) {
    console.error('No user ID found in subscription data:', data.id)
    return
  }

  // Map Polar status to our status type
  const status = mapSubscriptionStatus(data.status)

  const productId = getProductId(data)
  const currentPeriodEnd = getCurrentPeriodEnd(data)

  // Upsert subscription record
  await upsertSubscription({
    id: data.id,
    userId,
    productId,
    priceId: getPriceId(data),
    status,
    currentPeriodStart: getCurrentPeriodStart(data),
    currentPeriodEnd,
    cancelAtPeriodEnd: getCancelAtPeriodEnd(data),
    trialStart: getTrialStart(data),
    trialEnd: getTrialEnd(data),
    metadata: toSafeMetadata(data.metadata),
  })

  // Update user profile subscription tier if subscription is active
  if (status === 'active' || status === 'trialing') {
    await updateUserSubscriptionTier(
      userId,
      productId,
      currentPeriodEnd,
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
    canceledAt: getCanceledAt(data) ?? new Date().toISOString(),
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
 * Extract amount from Polar order data
 * Polar sends multiple amount fields, prefer totalAmount
 * Supports both camelCase and snake_case
 */
function extractOrderAmount(data: PolarOrderData): number {
  return data.totalAmount ?? data.total_amount ?? data.netAmount ?? data.net_amount ?? data.amount ?? 0
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

  const amount = extractOrderAmount(data)

  await createOrder({
    id: data.id,
    userId,
    subscriptionId: getSubscriptionId(data),
    productId: getProductId(data),
    amount,
    currency: data.currency || 'usd',
    status: 'pending',
    checkoutId: getCheckoutId(data),
    billingReason: mapBillingReason(getBillingReason(data)),
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
    const amount = extractOrderAmount(data)

    await createOrder({
      id: data.id,
      userId,
      subscriptionId: getSubscriptionId(data),
      productId: getProductId(data),
      amount,
      currency: data.currency || 'usd',
      status: 'paid',
      checkoutId: getCheckoutId(data),
      billingReason: mapBillingReason(getBillingReason(data)),
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
 * Polar sends user ID in:
 * 1. data.metadata.userId (set during checkout)
 * 2. data.customer.externalId / external_id (set via externalCustomerId during checkout)
 * 3. data.customer.metadata.userId (fallback)
 * 4. data.customerId / customer_id (Polar's internal customer ID - not our user ID)
 */
function extractUserId(data: PolarSubscriptionData | PolarOrderData): string | null {
  // Check subscription/order metadata first (set during checkout)
  if (data.metadata?.userId && typeof data.metadata.userId === 'string') {
    return data.metadata.userId
  }

  // Check customer.externalId (this is where externalCustomerId from checkout goes)
  const customerExternalId = getCustomerExternalId(data.customer)
  if (customerExternalId) {
    return customerExternalId
  }

  // Check customer metadata as fallback
  if (data.customer?.metadata?.userId && typeof data.customer.metadata.userId === 'string') {
    return data.customer.metadata.userId
  }

  // Log warning if we can't find user ID
  console.warn('Could not extract userId from webhook data:', {
    subscriptionId: data.id,
    hasMetadata: !!data.metadata,
    hasCustomer: !!data.customer,
    customerExternalId,
    customerId: data.customerId ?? data.customer_id,
  })

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
 * Note: Polar SDK uses snake_case for billing reason values
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
