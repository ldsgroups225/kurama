import { and, eq, gte, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, studySessions, userLessonMastery, userProfiles, userProgress } from '@kurama/data-ops/drizzle/schema'
import { getXPLeaderboard } from '@kurama/data-ops/queries/leaderboard'
import { getStreakData } from '@kurama/data-ops/queries/streak'
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

    // Get total cards studied by user
    const cardsStudiedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))

    const totalCardsStudied = Number(cardsStudiedResult[0]?.count ?? 0)

    // Get total cards available in the system
    const totalCardsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(cards)

    const totalCardsAvailable = Number(totalCardsResult[0]?.count ?? 0)

    // Get XP from user profile
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

    // Calculate streak using shared utility (eliminates code duplication)
    const streakData = await getStreakData(db, userId)
    const { currentStreak, longestStreak, streakHistory: uniqueDates } = streakData

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

    // Get lessons completed count
    const lessonsCompletedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userLessonMastery)
      .where(
        and(
          eq(userLessonMastery.userId, userId),
          gte(userLessonMastery.successfulTestCount, 2),
        ),
      )

    const lessonsCompleted = Number(lessonsCompletedResult[0]?.count ?? 0)

    // Calculate achievements/badges
    const achievements = [
      {
        id: 'beginner',
        name: 'Débutant',
        description: 'Commencer votre parcours',
        unlocked: totalCardsStudied > 0,
        icon: 'Award',
      },
      {
        id: 'streak-7',
        name: 'Série 7j',
        description: 'Maintenir une série de 7 jours',
        unlocked: longestStreak >= 7,
        icon: 'Flame',
      },
      {
        id: 'cards-100',
        name: '100 Cartes',
        description: 'Étudier 100 cartes',
        unlocked: totalCardsStudied >= 100,
        icon: 'Target',
      },
      {
        id: 'progress',
        name: 'Progrès',
        description: 'Compléter une leçon',
        unlocked: lessonsCompleted >= 1,
        icon: 'TrendingUp',
      },
      {
        id: 'regular',
        name: 'Régulier',
        description: 'Étudier 30 jours au total',
        unlocked: uniqueDates.length >= 30,
        icon: 'Calendar',
      },
      {
        id: 'expert',
        name: 'Expert',
        description: 'Atteindre 5000 XP',
        unlocked: totalXP >= 5000,
        icon: 'Trophy',
      },
      {
        id: 'reader',
        name: 'Lecteur',
        description: 'Étudier 500 cartes',
        unlocked: totalCardsStudied >= 500,
        icon: 'BookOpen',
      },
      {
        id: 'champion',
        name: 'Champion',
        description: 'Atteindre 10000 XP',
        unlocked: totalXP >= 10000,
        icon: 'Award',
      },
    ]

    const unlockedCount = achievements.filter(a => a.unlocked).length

    // Get leaderboard data
    const leaderboard = await getXPLeaderboard(db, { limit: 10, currentUserId: userId })

    return {
      totalCardsStudied,
      totalCardsAvailable,
      totalXP,
      rankPercentage,
      currentStreak,
      longestStreak,
      totalStudyTimeHours,
      weeklyActivity,
      lessonsCompleted,
      achievements,
      unlockedCount,
      totalAchievements: achievements.length,
      leaderboard,
    }
  })
