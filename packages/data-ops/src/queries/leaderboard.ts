/**
 * Leaderboard Queries
 *
 * Provides XP-based leaderboard functionality for gamification.
 * Returns top users ranked by XP with rank change tracking.
 * Filters by grade and series to show relevant peers.
 *
 * @module @kurama/data-ops/queries/leaderboard
 */

import { and, desc, eq, isNotNull, sql } from 'drizzle-orm'
import { userProfiles } from '../drizzle/schema'
import type { Database } from '../database/setup'

/**
 * Leaderboard entry for XP rankings
 */
export interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  points: number
  rank: number
  previousRank?: number
  isCurrentUser?: boolean
}

/**
 * User profile context for filtering leaderboard
 */
interface UserContext {
  gradeId: number | null
  seriesId: number | null
}

/**
 * Get user's grade and series context for leaderboard filtering
 */
async function getUserContext(
  db: Database,
  userId: string,
): Promise<UserContext | null> {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { gradeId: true, seriesId: true },
  })

  if (!profile) return null

  return {
    gradeId: profile.gradeId,
    seriesId: profile.seriesId,
  }
}


/**
 * Get XP leaderboard (top users by total XP)
 * Filters by:
 * - Student user type only
 * - Same grade as current user
 * - Same series if applicable (for Lycée students)
 */
export async function getXPLeaderboard(
  db: Database,
  options: {
    limit?: number
    currentUserId?: string
  } = {},
): Promise<LeaderboardEntry[]> {
  const { limit = 10, currentUserId } = options

  // Get current user's context for filtering
  let userContext: UserContext | null = null
  if (currentUserId) {
    userContext = await getUserContext(db, currentUserId)
  }

  // If user has no grade, return empty leaderboard
  if (currentUserId && !userContext?.gradeId) {
    return []
  }

  // Build filter conditions
  const conditions = [
    eq(userProfiles.userType, 'student'),
    isNotNull(userProfiles.gradeId),
  ]

  // Filter by grade if user has one
  if (userContext?.gradeId) {
    conditions.push(eq(userProfiles.gradeId, userContext.gradeId))
  }

  // Filter by series if user has one (Lycée students)
  if (userContext?.seriesId) {
    conditions.push(eq(userProfiles.seriesId, userContext.seriesId))
  }

  // Get top users by XP within the same grade/series
  const topUsers = await db
    .select({
      userId: userProfiles.userId,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      xp: userProfiles.xp,
    })
    .from(userProfiles)
    .where(and(...conditions))
    .orderBy(desc(userProfiles.xp))
    .limit(limit)

  // Build leaderboard entries
  const leaderboard: LeaderboardEntry[] = topUsers.map((user, index) => ({
    id: user.userId,
    name: `${user.firstName} ${user.lastName?.charAt(0) ?? ''}.`.trim(),
    points: user.xp ?? 0,
    rank: index + 1,
    isCurrentUser: currentUserId ? user.userId === currentUserId : false,
  }))

  // If current user is not in top list, add them at the end with their actual rank
  if (currentUserId && !leaderboard.some(e => e.isCurrentUser)) {
    const currentUserRank = await getUserRank(db, currentUserId, userContext)
    if (currentUserRank) {
      leaderboard.push(currentUserRank)
    }
  }

  return leaderboard
}

/**
 * Get a specific user's rank and info within their grade/series
 */
export async function getUserRank(
  db: Database,
  userId: string,
  userContext?: UserContext | null,
): Promise<LeaderboardEntry | null> {
  // Get user's profile
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  })

  if (!profile) return null

  // Get context if not provided
  const context = userContext ?? {
    gradeId: profile.gradeId,
    seriesId: profile.seriesId,
  }

  // If user has no grade, can't calculate rank
  if (!context.gradeId) return null

  // Build filter conditions for counting users with more XP
  const conditions = [
    eq(userProfiles.userType, 'student'),
    eq(userProfiles.gradeId, context.gradeId),
    sql`${userProfiles.xp} > ${profile.xp ?? 0}`,
  ]

  // Filter by series if applicable
  if (context.seriesId) {
    conditions.push(eq(userProfiles.seriesId, context.seriesId))
  }

  // Count users with more XP to determine rank
  const rankResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(userProfiles)
    .where(and(...conditions))

  const rank = Number(rankResult[0]?.count ?? 0) + 1

  return {
    id: profile.userId,
    name: `${profile.firstName} ${profile.lastName?.charAt(0) ?? ''}.`.trim(),
    points: profile.xp ?? 0,
    rank,
    isCurrentUser: true,
  }
}

/**
 * Get weekly leaderboard (users ranked by XP gained this week)
 * Note: This requires tracking weekly XP separately or calculating from sessions
 * For now, uses total XP as a proxy
 */
export async function getWeeklyLeaderboard(
  db: Database,
  options: {
    limit?: number
    currentUserId?: string
  } = {},
): Promise<LeaderboardEntry[]> {
  // For now, use total XP leaderboard
  // TODO: Implement weekly XP tracking for true weekly rankings
  return getXPLeaderboard(db, options)
}
