import { eq, desc } from "drizzle-orm";
import { getDb } from "../database/setup";
import {
  referrals,
  userProfiles,
  type InsertReferral,
  type SelectReferral,
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
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const existingCode = await getUserReferralCode(userId);

  if (existingCode) {
    return existingCode;
  }

  const newCode = generateReferralCode(userId);
  await setUserReferralCode(userId, newCode);

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

  // Find the referral by code
  const referral = await getReferralByCode(referralCode);
  if (!referral) return null;

  // Update the referral
  const result = await db
    .update(referrals)
    .set({
      referredUserId,
      status: 'completed',
      completedAt: now,
    })
    .where(eq(referrals.referralCode, referralCode))
    .returning();

  return result[0] || null;
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
 * Process referral reward when referred user makes first purchase
 */
export async function processReferralReward(referredUserId: string): Promise<void> {
  const db = getDb();

  // Get the referred user's profile to find who referred them
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, referredUserId),
    columns: {
      referredBy: true,
    },
  });

  if (!profile?.referredBy) return;

  // Find the referral entry
  const referral = await getReferralByCode(profile.referredBy);
  if (!referral || referral.status === 'rewarded') return;

  // Complete and reward the referral
  await completeReferral(profile.referredBy, referredUserId);

  // In a real implementation, you would:
  // 1. Credit the referrer's account
  // 2. Send notification to referrer
  // 3. Mark as rewarded
  if (referral.id) {
    await markReferralRewarded(referral.id);
  }
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
