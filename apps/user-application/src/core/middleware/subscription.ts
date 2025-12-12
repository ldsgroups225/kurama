/**
 * Subscription Middleware
 * 
 * Middleware for protecting premium features based on subscription status.
 */

import { createMiddleware } from '@tanstack/react-start'
import { getUserSubscriptionTier, hasActiveSubscription } from '@kurama/data-ops/queries/subscriptions'
import type { SubscriptionTier } from '@kurama/data-ops/drizzle/schema'

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  monthly: 1,
  quarterly: 2,
  annual: 3,
}

/**
 * Middleware that requires any active subscription
 */
export const requireSubscription = createMiddleware().server(async ({ next, context }) => {
  const userId = (context as { userId?: string }).userId

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const hasSubscription = await hasActiveSubscription(userId)

  if (!hasSubscription) {
    throw new Error('Active subscription required')
  }

  return next({
    context: {
      ...context,
      hasSubscription: true,
    },
  })
})

/**
 * Middleware that requires a minimum subscription tier
 */
export function requireTier(minimumTier: SubscriptionTier) {
  return createMiddleware().server(async ({ next, context }) => {
    const userId = (context as { userId?: string }).userId

    if (!userId) {
      throw new Error('User not authenticated')
    }

    const userTier = await getUserSubscriptionTier(userId)
    const userTierLevel = TIER_HIERARCHY[userTier]
    const requiredTierLevel = TIER_HIERARCHY[minimumTier]

    if (userTierLevel < requiredTierLevel) {
      throw new Error(`Subscription tier '${minimumTier}' or higher required`)
    }

    return next({
      context: {
        ...context,
        subscriptionTier: userTier,
      },
    })
  })
}

/**
 * Middleware that adds subscription info to context (non-blocking)
 */
export const subscriptionInfoMiddleware = createMiddleware().server(async ({ next, context }) => {
  const userId = (context as { userId?: string }).userId

  if (!userId) {
    return next({
      context: {
        ...context,
        subscriptionTier: 'free' as SubscriptionTier,
        hasSubscription: false,
      },
    })
  }

  try {
    const [tier, hasSubscription] = await Promise.all([
      getUserSubscriptionTier(userId),
      hasActiveSubscription(userId),
    ])

    return next({
      context: {
        ...context,
        subscriptionTier: tier,
        hasSubscription,
      },
    })
  } catch (error) {
    console.error('Error fetching subscription info:', error)
    return next({
      context: {
        ...context,
        subscriptionTier: 'free' as SubscriptionTier,
        hasSubscription: false,
      },
    })
  }
})

/**
 * Helper to check if a tier meets minimum requirement
 */
export function tierMeetsRequirement(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier]
}

/**
 * Feature flags based on subscription tier
 */
export const TIER_FEATURES: Record<SubscriptionTier, {
  maxLessonsPerDay: number;
  hasOfflineAccess: boolean;
  hasAdvancedStats: boolean;
  hasExamMode: boolean;
  hasPrioritySupport: boolean;
  hasNoAds: boolean;
}> = {
  free: {
    maxLessonsPerDay: 3,
    hasOfflineAccess: false,
    hasAdvancedStats: false,
    hasExamMode: false,
    hasPrioritySupport: false,
    hasNoAds: false,
  },
  monthly: {
    maxLessonsPerDay: Infinity,
    hasOfflineAccess: true,
    hasAdvancedStats: true,
    hasExamMode: true,
    hasPrioritySupport: false,
    hasNoAds: true,
  },
  quarterly: {
    maxLessonsPerDay: Infinity,
    hasOfflineAccess: true,
    hasAdvancedStats: true,
    hasExamMode: true,
    hasPrioritySupport: true,
    hasNoAds: true,
  },
  annual: {
    maxLessonsPerDay: Infinity,
    hasOfflineAccess: true,
    hasAdvancedStats: true,
    hasExamMode: true,
    hasPrioritySupport: true,
    hasNoAds: true,
  },
}

/**
 * Get features for a subscription tier
 */
export function getTierFeatures(tier: SubscriptionTier) {
  return TIER_FEATURES[tier]
}
