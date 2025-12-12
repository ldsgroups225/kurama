import { z } from "zod";

// Subscription status enum
export const subscriptionStatusSchema = z.enum([
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused',
]);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

// Subscription tier enum
export const subscriptionTierSchema = z.enum([
  'free',
  'monthly',
  'quarterly',
  'annual',
]);

export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;

// Order status enum
export const orderStatusSchema = z.enum([
  'pending',
  'paid',
  'refunded',
  'failed',
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

// Billing reason enum
export const billingReasonSchema = z.enum([
  'purchase',
  'subscription_create',
  'subscription_cycle',
  'subscription_update',
]);

export type BillingReason = z.infer<typeof billingReasonSchema>;

// Referral status enum
export const referralStatusSchema = z.enum([
  'pending',
  'completed',
  'expired',
  'rewarded',
]);

export type ReferralStatus = z.infer<typeof referralStatusSchema>;

// Subscription create/update schema
export const subscriptionSchema = z.object({
  id: z.string().min(1, "Subscription ID is required"),
  userId: z.string().min(1, "User ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  priceId: z.string().optional(),
  status: subscriptionStatusSchema,
  currentPeriodStart: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().default(false),
  canceledAt: z.string().optional(),
  trialStart: z.string().optional(),
  trialEnd: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

// Order create schema
export const orderSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  userId: z.string().min(1, "User ID is required"),
  subscriptionId: z.string().optional(),
  productId: z.string().min(1, "Product ID is required"),
  amount: z.number().int().min(0, "Amount must be positive"),
  currency: z.string().default("usd"),
  status: orderStatusSchema,
  checkoutId: z.string().optional(),
  billingReason: billingReasonSchema.optional(),
  paidAt: z.string().optional(),
  refundedAt: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

// Referral create schema
export const referralSchema = z.object({
  referrerUserId: z.string().min(1, "Referrer user ID is required"),
  referredUserId: z.string().optional(),
  referralCode: z.string().min(6, "Referral code must be at least 6 characters"),
  status: referralStatusSchema.default('pending'),
  rewardAmount: z.number().int().default(300), // $3.00 in cents
});

export type ReferralInput = z.infer<typeof referralSchema>;

// Discount usage schema
export const discountUsageSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  discountCode: z.string().min(1, "Discount code is required"),
  orderId: z.string().optional(),
  discountAmount: z.number().int().min(0, "Discount amount must be positive"),
});

export type DiscountUsageInput = z.infer<typeof discountUsageSchema>;

// Webhook event types
export const webhookEventTypeSchema = z.enum([
  'checkout.created',
  'checkout.updated',
  'subscription.created',
  'subscription.updated',
  'subscription.active',
  'subscription.canceled',
  'subscription.uncanceled',
  'subscription.revoked',
  'order.created',
  'order.updated',
  'order.paid',
  'order.refunded',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.state_changed',
]);

export type WebhookEventType = z.infer<typeof webhookEventTypeSchema>;

// Product ID to tier mapping
export const PRODUCT_TIER_MAP: Record<string, SubscriptionTier> = {
  'kurama-monthly': 'monthly',
  'kurama-quarterly': 'quarterly',
  'kurama-annual': 'annual',
};

// Helper to get tier from product ID
export function getSubscriptionTier(productId: string): SubscriptionTier {
  // Check if productId contains tier keywords
  if (productId.includes('annual') || productId.includes('yearly')) return 'annual';
  if (productId.includes('quarterly') || productId.includes('3-month')) return 'quarterly';
  if (productId.includes('monthly')) return 'monthly';

  // Check direct mapping
  return PRODUCT_TIER_MAP[productId] || 'free';
}

// Checkout create input
export const checkoutCreateSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  successUrl: z.url("Valid success URL is required"),
  cancelUrl: z.url().optional(),
  customerEmail: z.email().optional(),
  customerId: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  discountCode: z.string().optional(),
});

export type CheckoutCreateInput = z.infer<typeof checkoutCreateSchema>;

// Customer portal input
export const customerPortalSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  returnUrl: z.url().optional(),
});

export type CustomerPortalInput = z.infer<typeof customerPortalSchema>;
