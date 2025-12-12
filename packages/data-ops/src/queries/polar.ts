/**
 * Polar Payment Queries
 * 
 * Re-exports subscription, order, and referral queries for convenience.
 * Also provides combined utilities for payment operations.
 */

// Re-export all subscription queries
export {
  upsertSubscription,
  getSubscriptionById,
  getActiveSubscription,
  getUserSubscriptions,
  updateSubscriptionStatus,
  cancelSubscription,
  updateUserSubscriptionTier,
  downgradeUserToFree,
  hasActiveSubscription,
  getUserSubscriptionTier,
} from "./subscriptions";

// Re-export all order queries
export {
  createOrder,
  getOrderById,
  getUserOrders,
  getOrdersBySubscription,
  updateOrderStatus,
  markOrderPaid,
  markOrderRefunded,
  getUserTotalSpent,
  hasUserPurchased,
} from "./orders";

// Re-export all referral queries
export {
  generateReferralCode,
  createReferral,
  getReferralByCode,
  getUserReferrals,
  getUserReferralCode,
  setUserReferralCode,
  getOrCreateReferralCode,
  completeReferral,
  markReferralRewarded,
  getReferralStats,
  processReferralReward,
  trackReferredBy,
} from "./referrals";

// Re-export Zod schemas and types
export {
  subscriptionStatusSchema,
  subscriptionTierSchema,
  orderStatusSchema,
  billingReasonSchema,
  referralStatusSchema,
  subscriptionSchema,
  orderSchema,
  referralSchema,
  discountUsageSchema,
  webhookEventTypeSchema,
  checkoutCreateSchema,
  customerPortalSchema,
  getSubscriptionTier,
  PRODUCT_TIER_MAP,
  type SubscriptionStatus,
  type SubscriptionTier,
  type OrderStatus,
  type BillingReason,
  type ReferralStatus,
  type WebhookEventType,
  type SubscriptionInput,
  type OrderInput,
  type ReferralInput,
  type DiscountUsageInput,
  type CheckoutCreateInput,
  type CustomerPortalInput,
} from "../zod-schema/polar";
