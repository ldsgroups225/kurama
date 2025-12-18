/**
 * Streak Calculation Utilities
 *
 * Single source of truth for all streak-related calculations.
 * Eliminates code duplication across dashboard.ts, profile.ts, progress.ts, and stats.ts.
 *
 * Features:
 * - Consistent timezone handling (Africa/Abidjan)
 * - Optimized database queries with 365-day lookback
 * - Tiered XP bonus system
 * - Achievement tracking
 * - Streak freeze support (premium feature)
 * - Longest streak persistence
 * - Streak statistics and analytics
 *
 * @module @kurama/data-ops/queries/streak
 */

import { desc, eq, gte, and } from 'drizzle-orm'
import { studySessions, userProfiles } from '../drizzle/schema'
import type { Database } from '../database/setup'

/**
 * Server timezone for consistent date calculations
 * Using Africa/Abidjan (GMT+0) for Côte d'Ivoire users
 */
const SERVER_TIMEZONE = 'Africa/Abidjan'

/**
 * Maximum days to look back for streak calculation (performance optimization)
 */
const MAX_STREAK_LOOKBACK_DAYS = 365

/**
 * Streak calculation result
 */
export interface StreakResult {
  currentStreak: number
  longestStreak: number
  streakHistory: string[] // Array of YYYY-MM-DD dates with study activity
  lastStudyDate: string | null
  isActiveToday: boolean
}

/**
 * Streak multiplier tiers for XP bonus calculation
 * Uses the enhanced tiered system (not the legacy linear system)
 */
export interface StreakMultiplierTier {
  minDays: number
  multiplier: number
  bonusPercent: number
  label: string
}

export const STREAK_MULTIPLIER_TIERS: StreakMultiplierTier[] = [
  { minDays: 30, multiplier: 1.5, bonusPercent: 50, label: '30+ jours' },
  { minDays: 14, multiplier: 1.4, bonusPercent: 40, label: '2+ semaines' },
  { minDays: 7, multiplier: 1.25, bonusPercent: 25, label: '1+ semaine' },
  { minDays: 3, multiplier: 1.1, bonusPercent: 10, label: '3+ jours' },
  { minDays: 0, multiplier: 1.0, bonusPercent: 0, label: 'Aucun bonus' },
]

/**
 * Normalize a date to YYYY-MM-DD format using server timezone
 * This ensures consistent date handling regardless of user's local timezone
 */
export function normalizeToDateString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  // Use toLocaleDateString with 'en-CA' locale for YYYY-MM-DD format
  return d.toLocaleDateString('en-CA', { timeZone: SERVER_TIMEZONE })
}

/**
 * Get today's date string in server timezone
 */
export function getTodayDateString(): string {
  return normalizeToDateString(new Date())
}

/**
 * Get yesterday's date string in server timezone
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return normalizeToDateString(yesterday)
}

/**
 * Calculate the difference in days between two date strings
 */
function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const date1 = new Date(dateStr1)
  const date2 = new Date(dateStr2)
  const diffTime = Math.abs(date1.getTime() - date2.getTime())
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Fetch unique study dates for a user (optimized query)
 * Returns dates in descending order (most recent first)
 */
async function fetchStudyDates(
  db: Database,
  userId: string,
): Promise<string[]> {
  // Limit query to recent sessions for performance
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - MAX_STREAK_LOOKBACK_DAYS)

  const sessionsResult = await db
    .select({ startedAt: studySessions.startedAt })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        gte(studySessions.startedAt, cutoffDate.toISOString()),
      ),
    )
    .orderBy(desc(studySessions.startedAt))

  // Extract unique dates normalized to server timezone
  const uniqueDates = Array.from(
    new Set(sessionsResult.map(s => normalizeToDateString(s.startedAt))),
  )

  return uniqueDates
}

/**
 * Calculate current streak from an array of unique study dates
 * Dates must be sorted in descending order (most recent first)
 */
function calculateCurrentStreakFromDates(uniqueDates: string[]): number {
  if (uniqueDates.length === 0) return 0

  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()
  const mostRecentDate = uniqueDates[0]

  // Streak is broken if most recent study was more than 1 day ago
  if (mostRecentDate !== today && mostRecentDate !== yesterday) {
    return 0
  }

  // Count consecutive days backwards from most recent
  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDateStr = uniqueDates[i - 1]
    const currDateStr = uniqueDates[i]

    if (!prevDateStr || !currDateStr) continue

    const diffDays = getDaysDifference(prevDateStr, currDateStr)

    if (diffDays === 1) {
      streak++
    }
    else {
      break // Gap found, streak ends
    }
  }

  return streak
}

/**
 * Calculate longest streak from an array of unique study dates
 * Dates must be sorted in descending order (most recent first)
 */
function calculateLongestStreakFromDates(uniqueDates: string[]): number {
  if (uniqueDates.length === 0) return 0

  let longestStreak = 1
  let tempStreak = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDateStr = uniqueDates[i - 1]
    const currDateStr = uniqueDates[i]

    if (!prevDateStr || !currDateStr) continue

    const diffDays = getDaysDifference(prevDateStr, currDateStr)

    if (diffDays === 1) {
      tempStreak++
    }
    else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }

  return Math.max(longestStreak, tempStreak)
}

/**
 * Calculate current streak for a user
 * This is the main function to use when you only need the current streak
 */
export async function calculateCurrentStreak(
  db: Database,
  userId: string,
): Promise<number> {
  const uniqueDates = await fetchStudyDates(db, userId)
  return calculateCurrentStreakFromDates(uniqueDates)
}

/**
 * Calculate longest streak for a user
 */
export async function calculateLongestStreak(
  db: Database,
  userId: string,
): Promise<number> {
  const uniqueDates = await fetchStudyDates(db, userId)
  return calculateLongestStreakFromDates(uniqueDates)
}

/**
 * Get comprehensive streak data for a user
 * Use this when you need multiple streak metrics (avoids duplicate queries)
 */
export async function getStreakData(
  db: Database,
  userId: string,
): Promise<StreakResult> {
  const uniqueDates = await fetchStudyDates(db, userId)

  const today = getTodayDateString()
  const mostRecentDate = uniqueDates[0] ?? null

  return {
    currentStreak: calculateCurrentStreakFromDates(uniqueDates),
    longestStreak: calculateLongestStreakFromDates(uniqueDates),
    streakHistory: uniqueDates,
    lastStudyDate: mostRecentDate,
    isActiveToday: mostRecentDate === today,
  }
}

/**
 * Calculate streak multiplier for XP bonus
 * Uses the enhanced tiered system (standardized across the app)
 *
 * Tiers:
 * - 30+ days: 1.5x (50% bonus)
 * - 14+ days: 1.4x (40% bonus)
 * - 7+ days: 1.25x (25% bonus)
 * - 3+ days: 1.1x (10% bonus)
 * - 0-2 days: 1.0x (no bonus)
 */
export function calculateStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 1.5
  if (streakDays >= 14) return 1.4
  if (streakDays >= 7) return 1.25
  if (streakDays >= 3) return 1.1
  return 1.0
}

/**
 * Get streak tier information for display
 */
export function getStreakTier(streakDays: number): StreakMultiplierTier {
  for (const tier of STREAK_MULTIPLIER_TIERS) {
    if (streakDays >= tier.minDays) {
      return tier
    }
  }
  return STREAK_MULTIPLIER_TIERS[STREAK_MULTIPLIER_TIERS.length - 1]!
}

/**
 * Calculate XP bonus from streak
 * Returns the bonus amount (not the total)
 */
export function calculateStreakBonus(baseXP: number, streakDays: number): number {
  const multiplier = calculateStreakMultiplier(streakDays)
  return Math.round(baseXP * (multiplier - 1))
}

/**
 * Check if streak is at risk (studied yesterday but not today)
 */
export function isStreakAtRisk(lastStudyDate: string | null): boolean {
  if (!lastStudyDate) return false

  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()

  return lastStudyDate === yesterday && lastStudyDate !== today
}

/**
 * Get days until streak breaks
 * Returns 0 if already broken, 1 if at risk, 2 if safe for today
 */
export function getDaysUntilStreakBreaks(lastStudyDate: string | null): number {
  if (!lastStudyDate) return 0

  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()

  if (lastStudyDate === today) return 2 // Safe, studied today
  if (lastStudyDate === yesterday) return 1 // At risk, need to study today
  return 0 // Already broken
}

/**
 * Streak achievement thresholds
 */
export const STREAK_ACHIEVEMENTS = {
  'streak-3': { days: 3, name: 'Série 3 jours', rarity: 'common' },
  'streak-7': { days: 7, name: 'Série 7 jours', rarity: 'rare' },
  'streak-14': { days: 14, name: 'Série 2 semaines', rarity: 'epic' },
  'streak-30': { days: 30, name: 'Série 30 jours', rarity: 'legendary' },
  'streak-60': { days: 60, name: 'Série 60 jours', rarity: 'legendary' },
  'streak-100': { days: 100, name: 'Série 100 jours', rarity: 'legendary' },
} as const

/**
 * Check which streak achievements are unlocked
 */
export function getUnlockedStreakAchievements(currentStreak: number): string[] {
  const unlocked: string[] = []

  for (const [id, achievement] of Object.entries(STREAK_ACHIEVEMENTS)) {
    if (currentStreak >= achievement.days) {
      unlocked.push(id)
    }
  }

  return unlocked
}

/**
 * Get newly unlocked streak achievements (for notifications)
 */
export function getNewlyUnlockedStreakAchievements(
  previousStreak: number,
  currentStreak: number,
): string[] {
  const previousUnlocked = new Set(getUnlockedStreakAchievements(previousStreak))
  const currentUnlocked = getUnlockedStreakAchievements(currentStreak)

  return currentUnlocked.filter(id => !previousUnlocked.has(id))
}

// ============================================
// STREAK PERSISTENCE & UPDATES
// ============================================

/**
 * Update longest streak in user profile if current streak exceeds it
 * Call this after each study session to keep the cached value up to date
 */
export async function updateLongestStreakIfNeeded(
  db: Database,
  userId: string,
  currentStreak: number,
): Promise<{ updated: boolean, newLongestStreak: number }> {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { longestStreak: true },
  })

  const storedLongestStreak = profile?.longestStreak ?? 0

  if (currentStreak > storedLongestStreak) {
    await db
      .update(userProfiles)
      .set({
        longestStreak: currentStreak,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProfiles.userId, userId))

    return { updated: true, newLongestStreak: currentStreak }
  }

  return { updated: false, newLongestStreak: storedLongestStreak }
}

/**
 * Get cached longest streak from user profile
 * Falls back to calculating from sessions if not cached
 */
export async function getCachedLongestStreak(
  db: Database,
  userId: string,
): Promise<number> {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { longestStreak: true },
  })

  // If cached value exists and is > 0, use it
  if (profile?.longestStreak && profile.longestStreak > 0) {
    return profile.longestStreak
  }

  // Otherwise calculate and cache it
  const calculatedLongest = await calculateLongestStreak(db, userId)
  if (calculatedLongest > 0) {
    await db
      .update(userProfiles)
      .set({
        longestStreak: calculatedLongest,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProfiles.userId, userId))
  }

  return calculatedLongest
}

// ============================================
// STREAK FREEZE (PREMIUM FEATURE)
// ============================================

/**
 * Check if user can use a streak freeze
 * Premium users get streak freezes based on subscription tier
 */
export async function canUseStreakFreeze(
  db: Database,
  userId: string,
): Promise<{ canUse: boolean, freezesRemaining: number, reason?: string }> {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: {
      subscriptionTier: true,
      streakFreezeCount: true,
      lastStreakFreezeUsedAt: true,
    },
  })

  if (!profile) {
    return { canUse: false, freezesRemaining: 0, reason: 'Profile not found' }
  }

  // Free users don't get streak freezes
  if (profile.subscriptionTier === 'free') {
    return { canUse: false, freezesRemaining: 0, reason: 'Premium feature' }
  }

  // Check if already used today
  if (profile.lastStreakFreezeUsedAt) {
    const lastUsedDate = normalizeToDateString(profile.lastStreakFreezeUsedAt)
    const today = getTodayDateString()
    if (lastUsedDate === today) {
      return {
        canUse: false,
        freezesRemaining: profile.streakFreezeCount ?? 0,
        reason: 'Already used today',
      }
    }
  }

  const freezesRemaining = profile.streakFreezeCount ?? 0
  return {
    canUse: freezesRemaining > 0,
    freezesRemaining,
    reason: freezesRemaining === 0 ? 'No freezes remaining' : undefined,
  }
}

/**
 * Use a streak freeze to protect the streak for one day
 */
export async function useStreakFreeze(
  db: Database,
  userId: string,
): Promise<{ success: boolean, freezesRemaining: number, error?: string }> {
  const { canUse, freezesRemaining, reason } = await canUseStreakFreeze(db, userId)

  if (!canUse) {
    return { success: false, freezesRemaining, error: reason }
  }

  await db
    .update(userProfiles)
    .set({
      streakFreezeCount: freezesRemaining - 1,
      lastStreakFreezeUsedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userProfiles.userId, userId))

  return { success: true, freezesRemaining: freezesRemaining - 1 }
}

/**
 * Grant streak freezes to a user (e.g., on subscription upgrade)
 */
export async function grantStreakFreezes(
  db: Database,
  userId: string,
  count: number,
): Promise<void> {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { streakFreezeCount: true },
  })

  const currentCount = profile?.streakFreezeCount ?? 0

  await db
    .update(userProfiles)
    .set({
      streakFreezeCount: currentCount + count,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userProfiles.userId, userId))
}

// ============================================
// STREAK STATISTICS & ANALYTICS
// ============================================

/**
 * Streak statistics for a user
 */
export interface StreakStatistics {
  currentStreak: number
  longestStreak: number
  totalStudyDays: number
  averageStreakLength: number
  consistencyScore: number // Percentage of days studied in last 30 days
  bestStudyDayOfWeek: string | null
  totalStreaksStarted: number
}

/**
 * Get comprehensive streak statistics for a user
 */
export async function getStreakStatistics(
  db: Database,
  userId: string,
): Promise<StreakStatistics> {
  const uniqueDates = await fetchStudyDates(db, userId)
  const currentStreak = calculateCurrentStreakFromDates(uniqueDates)
  const longestStreak = calculateLongestStreakFromDates(uniqueDates)

  // Calculate total study days
  const totalStudyDays = uniqueDates.length

  // Calculate average streak length
  const streaks = calculateAllStreaks(uniqueDates)
  const averageStreakLength = streaks.length > 0
    ? streaks.reduce((sum, s) => sum + s, 0) / streaks.length
    : 0

  // Calculate consistency score (last 30 days)
  const last30Days = getLast30DaysDates()
  const studiedInLast30 = uniqueDates.filter(d => last30Days.includes(d)).length
  const consistencyScore = Math.round((studiedInLast30 / 30) * 100)

  // Find best study day of week
  const dayOfWeekCounts = getDayOfWeekCounts(uniqueDates)
  const bestStudyDayOfWeek = getBestDayOfWeek(dayOfWeekCounts)

  return {
    currentStreak,
    longestStreak,
    totalStudyDays,
    averageStreakLength: Math.round(averageStreakLength * 10) / 10,
    consistencyScore,
    bestStudyDayOfWeek,
    totalStreaksStarted: streaks.length,
  }
}

/**
 * Calculate all individual streaks from study dates
 */
function calculateAllStreaks(uniqueDates: string[]): number[] {
  if (uniqueDates.length === 0) return []

  const streaks: number[] = []
  let currentStreakLength = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDateStr = uniqueDates[i - 1]
    const currDateStr = uniqueDates[i]

    if (!prevDateStr || !currDateStr) continue

    const diffDays = getDaysDifference(prevDateStr, currDateStr)

    if (diffDays === 1) {
      currentStreakLength++
    }
    else {
      streaks.push(currentStreakLength)
      currentStreakLength = 1
    }
  }

  // Don't forget the last streak
  streaks.push(currentStreakLength)

  return streaks
}

/**
 * Get the last 30 days as date strings
 */
function getLast30DaysDates(): string[] {
  const dates: string[] = []
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(normalizeToDateString(date))
  }
  return dates
}

/**
 * Count study sessions by day of week
 */
function getDayOfWeekCounts(uniqueDates: string[]): Record<string, number> {
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const counts: Record<string, number> = {}

  for (const dayName of dayNames) {
    counts[dayName] = 0
  }

  for (const dateStr of uniqueDates) {
    const date = new Date(dateStr)
    const dayName = dayNames[date.getDay()]
    if (dayName) {
      counts[dayName] = (counts[dayName] ?? 0) + 1
    }
  }

  return counts
}

/**
 * Get the day of week with most study sessions
 */
function getBestDayOfWeek(counts: Record<string, number>): string | null {
  let bestDay: string | null = null
  let maxCount = 0

  for (const [day, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      bestDay = day
    }
  }

  return bestDay
}

// ============================================
// STREAK NOTIFICATIONS
// ============================================

/**
 * Notification types for streak events
 */
export type StreakNotificationType =
  | 'streak_at_risk'
  | 'streak_broken'
  | 'streak_milestone'
  | 'streak_freeze_available'
  | 'streak_freeze_used'

/**
 * Streak notification data
 */
export interface StreakNotification {
  type: StreakNotificationType
  title: string
  message: string
  data?: Record<string, unknown>
}

/**
 * Get streak notifications for a user
 */
export function getStreakNotifications(
  currentStreak: number,
  lastStudyDate: string | null,
  freezesAvailable: number,
): StreakNotification[] {
  const notifications: StreakNotification[] = []
  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()

  // Check if streak is at risk
  if (lastStudyDate === yesterday && lastStudyDate !== today) {
    notifications.push({
      type: 'streak_at_risk',
      title: '🔥 Série en danger !',
      message: `Votre série de ${currentStreak} jours va se terminer si vous n'étudiez pas aujourd'hui.`,
      data: { currentStreak, hoursRemaining: getHoursUntilMidnight() },
    })

    // Suggest using streak freeze if available
    if (freezesAvailable > 0) {
      notifications.push({
        type: 'streak_freeze_available',
        title: '❄️ Gel de série disponible',
        message: `Vous avez ${freezesAvailable} gel(s) de série. Utilisez-en un pour protéger votre série.`,
        data: { freezesAvailable },
      })
    }
  }

  // Check for milestone achievements
  const milestones = [3, 7, 14, 30, 60, 100]
  if (milestones.includes(currentStreak)) {
    const achievement = STREAK_ACHIEVEMENTS[`streak-${currentStreak}` as keyof typeof STREAK_ACHIEVEMENTS]
    if (achievement) {
      notifications.push({
        type: 'streak_milestone',
        title: '🏆 Nouveau record !',
        message: `Félicitations ! Vous avez atteint une série de ${currentStreak} jours !`,
        data: { currentStreak, achievement },
      })
    }
  }

  return notifications
}

/**
 * Get hours until midnight in server timezone
 */
function getHoursUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setDate(midnight.getDate() + 1)
  midnight.setHours(0, 0, 0, 0)

  const diffMs = midnight.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60))
}

// ============================================
// LEADERBOARD SUPPORT
// ============================================

/**
 * Leaderboard entry for streak rankings
 */
export interface StreakLeaderboardEntry {
  userId: string
  userName: string
  currentStreak: number
  longestStreak: number
  rank: number
}

/**
 * Get streak leaderboard (top users by current streak)
 * Note: This requires calculating streaks for all users, so use with caution
 * Consider caching results or using a materialized view for production
 */
export async function getStreakLeaderboard(
  db: Database,
  limit: number = 10,
): Promise<StreakLeaderboardEntry[]> {
  // Get users with their longest streaks (cached value)
  const profiles = await db
    .select({
      userId: userProfiles.userId,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      longestStreak: userProfiles.longestStreak,
    })
    .from(userProfiles)
    .where(gte(userProfiles.longestStreak, 1))
    .orderBy(desc(userProfiles.longestStreak))
    .limit(limit * 2) // Get more to filter by current streak

  // Calculate current streaks for top users
  const leaderboard: StreakLeaderboardEntry[] = []

  for (const profile of profiles) {
    const currentStreak = await calculateCurrentStreak(db, profile.userId)

    leaderboard.push({
      userId: profile.userId,
      userName: `${profile.firstName} ${profile.lastName.charAt(0)}.`,
      currentStreak,
      longestStreak: profile.longestStreak ?? 0,
      rank: 0, // Will be set after sorting
    })
  }

  // Sort by current streak, then longest streak
  leaderboard.sort((a, b) => {
    if (b.currentStreak !== a.currentStreak) {
      return b.currentStreak - a.currentStreak
    }
    return b.longestStreak - a.longestStreak
  })

  // Assign ranks and limit
  return leaderboard.slice(0, limit).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
}


