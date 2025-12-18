import { eq, desc, and, isNull } from "drizzle-orm";
import { getDb } from "../database/setup";
import {
  referrals,
  userProfiles,
  type InsertReferral,
  type SelectReferral,
  type ReferralStatus,
} from "../drizzle/schema";

/**
 * Generate a unique referral code
 */
export function generateReferralCode(userId: string): string {
  const prefix = 'KUR';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const userPart = userId.substring(0, 4).toUpperCase();
  return `${prefix}${userPart}${randomPart}`;
}

/**
 * Create a referral entry for a user
 */
export async function createReferral(data: InsertReferral): Promise<SelectReferral> {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .insert(referrals)
    .values({
      ...data,
      createdAt: now,
    })
    .returning();

  if (!result[0]) {
    throw new Error('Failed to create referral');
  }
  return result[0];
}

/**
 * Get referral by code
 */
export async function getReferralByCode(code: string): Promise<SelectReferral | null> {
  const db = getDb();

  const referral = await db.query.referrals.findFirst({
    where: eq(referrals.referralCode, code),
  });

  return referral || null;
}

/**
 * Get all referrals made by a user
 */
export async function getUserReferrals(userId: string): Promise<SelectReferral[]> {
  const db = getDb();

  const userReferrals = await db.query.referrals.findMany({
    where: eq(referrals.referrerUserId, userId),
    orderBy: [desc(referrals.createdAt)],
  });

  return userReferrals;
}

/**
 * Get user's referral code (from profile)
 */
export async function getUserReferralCode(userId: string): Promise<string | null> {
  const db = getDb();

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: {
      referralCode: true,
    },
  });

  return profile?.referralCode || null;
}

/**
 * Set user's referral code in profile
 */
export async function setUserReferralCode(userId: string, code: string): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  await db
    .update(userProfiles)
    .set({
      referralCode: code,
      updatedAt: now,
    })
    .where(eq(userProfiles.userId, userId));
}

/**
 * Get or create user's referral code
 * Also creates a referral entry in the referrals table
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const existingCode = await getUserReferralCode(userId);

  if (existingCode) {
    return existingCode;
  }

  const newCode = generateReferralCode(userId);
  await setUserReferralCode(userId, newCode);

  // Create a referral entry for tracking
  await createReferral({
    referrerUserId: userId,
    referralCode: newCode,
    status: 'pending',
  });

  return newCode;
}

/**
 * Mark referral as completed when referred user subscribes
 */
export async function completeReferral(
  referralCode: string,
  referredUserId: string
): Promise<SelectReferral | null> {
  const db = getDb();
  const now = new Date().toISOString();

  // Find the referral by code that hasn't been completed yet
  const referral = await db.query.referrals.findFirst({
    where: and(
      eq(referrals.referralCode, referralCode),
      isNull(referrals.referredUserId)
    ),
  });

  if (!referral) return null;

  // Update the referral
  const result = await db
    .update(referrals)
    .set({
      referredUserId,
      status: 'completed',
      completedAt: now,
    })
    .where(eq(referrals.id, referral.id))
    .returning();

  return result[0] || null;
}

/**
 * Get pending referral for a referred user
 */
export async function getPendingReferralForUser(referredUserId: string): Promise<SelectReferral | null> {
  const db = getDb();

  // Get the user's referredBy code
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, referredUserId),
    columns: {
      referredBy: true,
    },
  });

  if (!profile?.referredBy) return null;

  // Find the referral entry
  const referral = await db.query.referrals.findFirst({
    where: and(
      eq(referrals.referralCode, profile.referredBy),
      eq(referrals.referredUserId, referredUserId),
      eq(referrals.status, 'completed')
    ),
  });

  return referral || null;
}

/**
 * Mark referral as rewarded
 */
export async function markReferralRewarded(id: number): Promise<SelectReferral | null> {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .update(referrals)
    .set({
      status: 'rewarded',
      rewardedAt: now,
    })
    .where(eq(referrals.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
}> {
  const userReferrals = await getUserReferrals(userId);

  const completed = userReferrals.filter(r => r.status === 'completed' || r.status === 'rewarded');
  const pending = userReferrals.filter(r => r.status === 'pending');
  const rewarded = userReferrals.filter(r => r.status === 'rewarded');

  return {
    totalReferrals: userReferrals.length,
    completedReferrals: completed.length,
    pendingReferrals: pending.length,
    totalEarnings: rewarded.reduce((sum, r) => sum + r.rewardAmount, 0),
  };
}

/**
 * Referral reward result
 */
export interface ReferralRewardResult {
  success: boolean;
  referralId?: number;
  referrerUserId?: string;
  rewardAmount?: number;
  discountCode?: string;
  error?: string;
}

/**
 * Process referral reward when referred user makes first purchase
 * Returns info needed to create discount in Polar
 */
export async function processReferralReward(referredUserId: string): Promise<ReferralRewardResult> {
  const db = getDb();

  // Get the referred user's profile to find who referred them
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, referredUserId),
    columns: {
      referredBy: true,
    },
  });

  if (!profile?.referredBy) {
    return { success: false, error: 'No referral code found for user' };
  }

  // Find the referral entry that hasn't been rewarded yet
  const referral = await db.query.referrals.findFirst({
    where: and(
      eq(referrals.referralCode, profile.referredBy),
      eq(referrals.status, 'pending')
    ),
  });

  if (!referral) {
    // Check if already rewarded
    const existingReferral = await getReferralByCode(profile.referredBy);
    if (existingReferral?.status === 'rewarded') {
      return { success: false, error: 'Referral already rewarded' };
    }
    return { success: false, error: 'Referral not found' };
  }

  // Complete the referral (mark as completed with referred user)
  const completedReferral = await completeReferral(profile.referredBy, referredUserId);
  if (!completedReferral) {
    return { success: false, error: 'Failed to complete referral' };
  }

  return {
    success: true,
    referralId: completedReferral.id,
    referrerUserId: completedReferral.referrerUserId,
    rewardAmount: completedReferral.rewardAmount,
  };
}

/**
 * Mark referral as rewarded with discount code
 */
export async function markReferralRewardedWithDiscount(
  referralId: number,
  discountCode: string
): Promise<SelectReferral | null> {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .update(referrals)
    .set({
      status: 'rewarded',
      rewardedAt: now,
    })
    .where(eq(referrals.id, referralId))
    .returning();

  // Also store the discount code in the referrer's profile metadata or a separate field
  // For now, we'll log it
  console.warn(`Referral ${referralId} rewarded with discount code: ${discountCode}`);

  return result[0] || null;
}

/**
 * Track that a user was referred by a code
 */
export async function trackReferredBy(userId: string, referralCode: string): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  await db
    .update(userProfiles)
    .set({
      referredBy: referralCode,
      updatedAt: now,
    })
    .where(eq(userProfiles.userId, userId));
}
