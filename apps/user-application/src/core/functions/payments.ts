import process from 'node:process'
import {
  getUserOrders,
  getUserTotalSpent,
  hasUserPurchased,
} from '@kurama/data-ops/queries/orders'
import {
  getOrCreateReferralCode,
  getReferralStats,
  trackReferredBy,
} from '@kurama/data-ops/queries/referrals'
import {
  getActiveSubscription,
  getUserSubscriptions,
  getUserSubscriptionTier,
  hasActiveSubscription,
} from '@kurama/data-ops/queries/subscriptions'
import { createServerFn } from '@tanstack/react-start'
import { getRequestIP } from '@tanstack/react-start/server'
import z from 'zod'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'
import { polarMiddleware } from '@/core/middleware/polar'

export const baseFunction = createServerFn().middleware([
  protectedFunctionMiddleware,
  polarMiddleware,
])

// Protected function without Polar (for DB-only operations)
export const protectedFunction = createServerFn().middleware([
  protectedFunctionMiddleware,
])

/**
 * Get all available products from Polar
 */
export const getProducts = baseFunction.handler(async (ctx) => {
  const products = await ctx.context.polar.products.list({
    isArchived: false,
  })

  return products.result.items
})

const PaymentLinkSchema = z.object({
  productId: z.string(),
  discountCode: z.string().optional(),
  referralCode: z.string().optional(),
})

/**
 * Create a payment/checkout link
 */
export const createPaymentLink = baseFunction
  .inputValidator((data: z.infer<typeof PaymentLinkSchema>) => {
    return PaymentLinkSchema.parse(data)
  })
  .handler(async (ctx) => {
    const ip = getRequestIP()
    const { productId, discountCode, referralCode } = ctx.data

    // Track referral if provided
    if (referralCode) {
      try {
        await trackReferredBy(ctx.context.userId, referralCode)
      }
      catch (error) {
        console.error('Error tracking referral:', error)
      }
    }

    // Build success URL based on environment
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://kurama.yeko.workers.dev'
      : 'http://localhost:3000'

    const metadata: Record<string, string> = {
      userId: ctx.context.userId,
    }
    if (referralCode) {
      metadata.referralCode = referralCode
    }

    const checkout = await ctx.context.polar.checkouts.create({
      products: [productId],
      externalCustomerId: ctx.context.userId,
      successUrl: `${baseUrl}/app/polar/checkout/success?checkout_id={CHECKOUT_ID}`,
      customerIpAddress: ip,
      customerEmail: ctx.context.email,
      metadata,
      ...(discountCode && { discountCode }),
    })

    return checkout
  })

/**
 * Validate a payment/checkout
 */
export const validPayment = baseFunction
  .inputValidator((data: string) => {
    if (typeof data !== 'string') {
      throw new TypeError('Invalid data type')
    }
    return data
  })
  .handler(async (ctx) => {
    const payment = await ctx.context.polar.checkouts.get({
      id: ctx.data,
    })

    if (payment.status === 'succeeded') {
      return true
    }
    return false
  })

/**
 * Get user's current subscription from Polar
 */
export const collectSubscription = baseFunction.handler(async (ctx) => {
  const subscriptions = await ctx.context.polar.subscriptions.list({
    externalCustomerId: ctx.context.userId,
  })

  if (subscriptions.result.items.length === 0) {
    return null
  }

  return subscriptions.result.items[0]
})

/**
 * Get user's subscription from database
 */
export const getSubscription = protectedFunction.handler(async (ctx) => {
  const subscription = await getActiveSubscription(ctx.context.userId)
  return subscription
})

/**
 * Get all user subscriptions from database
 */
export const getAllSubscriptions = protectedFunction.handler(async (ctx) => {
  const subscriptions = await getUserSubscriptions(ctx.context.userId)
  return subscriptions
})

/**
 * Get user's subscription tier
 */
export const getSubscriptionTier = protectedFunction.handler(async (ctx) => {
  const tier = await getUserSubscriptionTier(ctx.context.userId)
  return tier
})

/**
 * Check if user has active subscription
 */
export const checkSubscription = protectedFunction.handler(async (ctx) => {
  const hasSubscription = await hasActiveSubscription(ctx.context.userId)
  return hasSubscription
})

/**
 * Get user's order history
 */
export const getOrderHistory = protectedFunction.handler(async (ctx) => {
  const orders = await getUserOrders(ctx.context.userId)
  return orders
})

/**
 * Get user's total spent amount
 */
export const getTotalSpent = protectedFunction.handler(async (ctx) => {
  const total = await getUserTotalSpent(ctx.context.userId)
  return total
})

/**
 * Check if user has made any purchase
 */
export const checkHasPurchased = protectedFunction.handler(async (ctx) => {
  const hasPurchased = await hasUserPurchased(ctx.context.userId)
  return hasPurchased
})

/**
 * Get or create user's referral code
 */
export const getReferralCode = protectedFunction.handler(async (ctx) => {
  const code = await getOrCreateReferralCode(ctx.context.userId)
  return code
})

/**
 * Get user's referral statistics
 */
export const getReferralStatistics = protectedFunction.handler(async (ctx) => {
  const stats = await getReferralStats(ctx.context.userId)
  return stats
})

/**
 * Get customer portal URL from Polar
 */
export const getCustomerPortalUrl = baseFunction.handler(async (ctx) => {
  try {
    // Get customer portal session
    const portal = await ctx.context.polar.customerSessions.create({
      externalCustomerId: ctx.context.userId,
    })

    return portal.customerPortalUrl
  }
  catch (error) {
    console.error('Error getting customer portal URL:', error)
    return null
  }
})

/**
 * Cancel subscription via Polar
 * Note: TcancelAtPeriodEnd to true, user keeps access until period ends
 */
const CancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
})

export const cancelSubscription = baseFunction
  .inputValidator((data: z.infer<typeof CancelSubscriptionSchema>) => {
    return CancelSubscriptionSchema.parse(data)
  })
  .handler(async (ctx) => {
    try {
      // Use update to set cancelAtPeriodEnd - Polar SDK doesn't have a direct cancel method
      await ctx.context.polar.subscriptions.update({
        id: ctx.data.subscriptionId,
        subscriptionUpdate: {
          cancelAtPeriodEnd: true,
        },
      })
      return { success: true }
    }
    catch (error) {
      console.error('Error canceling subscription:', error)
      return { success: false, error: 'Failed to cancel subscription' }
    }
  })
