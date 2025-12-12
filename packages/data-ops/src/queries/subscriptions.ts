import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../database/setup";
import {
  subscriptions,
  userProfiles,
  type InsertSubscription,
  type SelectSubscription,
  type SubscriptionStatus,
  type SubscriptionTier,
} from "../drizzle/schema";
import { getSubscriptionTier } from "../zod-schema/polar";

/**
 * Create or update a subscription
 */
export async function upsertSubscription(data: InsertSubscription): Promise<SelectSubscription> {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .insert(subscriptions)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [subscriptions.id],
      set: {
        status: data.status,
        priceId: data.priceId,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        canceledAt: data.canceledAt,
        trialStart: data.trialStart,
        trialEnd: data.trialEnd,
        metadata: data.metadata,
        updatedAt: now,
      },
    })
    .returning();

  if (!result[0]) {
    throw new Error('Failed to upsert subscription');
  }
  return result[0];
}

/**
 * Get subscription by ID
 */
export async function getSubscriptionById(id: string): Promise<SelectSubscription | null> {
  const db = getDb();

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, id),
  });

  return subscription || null;
}

/**
 * Get active subscription for a user
 */
export async function getActiveSubscription(userId: string): Promise<SelectSubscription | null> {
  const db = getDb();

  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active')
    ),
    orderBy: [desc(subscriptions.createdAt)],
  });

  return subscription || null;
}

/**
 * Get all subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<SelectSubscription[]> {
  const db = getDb();

  const userSubscriptions = await db.query.subscriptions.findMany({
    where: eq(subscriptions.userId, userId),
    orderBy: [desc(subscriptions.createdAt)],
  });

  return userSubscriptions;
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
  additionalData?: Partial<InsertSubscription>
): Promise<SelectSubscription | null> {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .update(subscriptions)
    .set({
      status,
      ...additionalData,
      updatedAt: now,
    })
    .where(eq(subscriptions.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(id: string): Promise<SelectSubscription | null> {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: now,
      cancelAtPeriodEnd: true,
      updatedAt: now,
    })
    .where(eq(subscriptions.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Update user profile subscription tier based on subscription
 */
export async function updateUserSubscriptionTier(
  userId: string,
  productId: string,
  expiresAt?: string
): Promise<void> {
  const db = getDb();
  const tier = getSubscriptionTier(productId);
  const now = new Date().toISOString();

  await db
    .update(userProfiles)
    .set({
      subscriptionTier: tier,
      subscriptionExpiresAt: expiresAt,
      updatedAt: now,
    })
    .where(eq(userProfiles.userId, userId));
}

/**
 * Downgrade user to free tier
 */
export async function downgradeUserToFree(userId: string): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  await db
    .update(userProfiles)
    .set({
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      updatedAt: now,
    })
    .where(eq(userProfiles.userId, userId));
}

/**
 * Check if user has active premium subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getActiveSubscription(userId);
  return subscription !== null;
}

/**
 * Get user subscription tier
 */
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const db = getDb();

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: {
      subscriptionTier: true,
      subscriptionExpiresAt: true,
    },
  });

  if (!profile) return 'free';

  // Check if subscription has expired
  if (profile.subscriptionExpiresAt) {
    const expiresAt = new Date(profile.subscriptionExpiresAt);
    if (expiresAt < new Date()) {
      // Subscription expired, should be downgraded
      return 'free';
    }
  }

  return profile.subscriptionTier;
}
