/**
 * Streak Calculation Utilities
 *
 * Single source of truth for all streak-related calculations.
 * Eliminates code duplication across dashboard.ts, profile.ts, progress.ts, and stats.ts.
 *
 * @module @kurama/data-ops/queries/streak
 */

import { desc, eq, gte, and } from 'drizzle-orm'
import { studySessions } from '../drizzle/schema'
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
