import { and, eq, gte, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, studySessions, userProfiles } from '@kurama/data-ops/drizzle/schema'
import { getUserAchievements } from '@kurama/data-ops/queries/achievements'
import { getXPLeaderboard } from '@kurama/data-ops/queries/leaderboard'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

/**
 * Get progress statistics for the current user
 */
export const getProgressStats = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const userId = context.userId

    // Get total cards available in the system
    const totalCardsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(cards)

    const totalCardsAvailable = Number(totalCardsResult[0]?.count ?? 0)

    // Get XP from user profile for rank calculation
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    })
    const totalXP = profile?.xp ?? 0

    // Calculate user's rank (percentage of users with less XP)
    const usersWithLessXPResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProfiles)
      .where(sql`${userProfiles.xp} < ${totalXP}`)

    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProfiles)

    const usersWithLessXP = Number(usersWithLessXPResult[0]?.count ?? 0)
    const totalUsers = Number(totalUsersResult[0]?.count ?? 1)
    const rankPercentage = totalUsers > 0 ? Math.round((usersWithLessXP / totalUsers) * 100) : 0

    // Calculate total study time this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const monthlySessionsResult = await db
      .select({ duration: studySessions.duration })
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          gte(studySessions.startedAt, startOfMonth.toISOString()),
        ),
      )

    const totalStudyTimeMinutes = monthlySessionsResult.reduce(
      (acc, s) => acc + (s.duration ?? 0),
      0,
    ) / 60 // Convert seconds to minutes

    const totalStudyTimeHours = Math.round(totalStudyTimeMinutes / 60)

    // Get weekly activity data (last 7 days) - using studySessions for accurate tracking
    // Optimized: Single query with GROUP BY instead of N+1 queries
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const weeklyData = await db
      .select({
        date: sql<string>`DATE(${studySessions.startedAt})`,
        total: sql<number>`COALESCE(SUM(${studySessions.cardsReviewed}), 0)`,
      })
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          gte(studySessions.startedAt, sevenDaysAgo.toISOString()),
        ),
      )
      .groupBy(sql`DATE(${studySessions.startedAt})`)

    // Build activity map from query results
    const activityMap = new Map<string, number>()
    for (const row of weeklyData) {
      activityMap.set(row.date, Number(row.total))
    }

    // Build weekly activity array for last 7 days
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
    const weeklyActivity: { day: string, cardsStudied: number, date: string }[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0] ?? ''
      const dayName = dayNames[date.getDay()] ?? 'D'

      weeklyActivity.push({
        day: dayName,
        cardsStudied: activityMap.get(dateStr) ?? 0,
        date: dateStr,
      })
    }

    // Get achievements with progress using new centralized system
    const { achievements, newlyUnlocked, stats } = await getUserAchievements(db, userId)

    // Get leaderboard data
    const leaderboard = await getXPLeaderboard(db, { limit: 10, currentUserId: userId })

    return {
      totalCardsStudied: stats.totalCardsStudied, // Now from centralized stats
      totalCardsAvailable,
      totalXP: stats.totalXP, // Now from centralized stats
      rankPercentage,
      currentStreak: stats.currentStreak, // Now from centralized stats
      longestStreak: stats.longestStreak, // Now from centralized stats
      totalStudyTimeHours,
      weeklyActivity,
      lessonsCompleted: stats.lessonsCompleted, // Now from centralized stats
      achievements,
      newlyUnlocked,
      unlockedCount: achievements.filter(a => a.unlocked).length,
      totalAchievements: achievements.length,
      leaderboard,
    }
  })
