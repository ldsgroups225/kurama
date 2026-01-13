import { and, eq, gte, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, studySessions, userProfiles, userProgress } from '@kurama/data-ops/drizzle/schema'
import { markAchievementsNotified as dbMarkAchievementsNotified, getUserAchievements } from '@kurama/data-ops/queries/achievements'
import { getXPLeaderboard } from '@kurama/data-ops/queries/leaderboard'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'
import { calculateSM2 } from '@/utils/sm2'

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

/**
 * Mark achievements as notified to prevent repeating animations
 */
export const markAchievementsAsNotified = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator((achievementIds: string[]) => achievementIds)
  .handler(async ({ context, data: achievementIds }) => {
    const db = getDb()
    const userId = context.userId

    await dbMarkAchievementsNotified(db, userId, achievementIds)

    return { success: true }
  })

/**
 * Update card progress based on SM-2 algorithm
 */
export const updateCardProgress = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: { cardId: number, quality: number, lessonId: number }[]) => data)
  .handler(async ({ context, data }) => {
    const db = getDb()
    const userId = context.userId

    for (const item of data) {
      const { cardId, quality, lessonId } = item

      // Get existing progress
      const existing = await db.query.userProgress.findFirst({
        where: and(
          eq(userProgress.userId, userId),
          eq(userProgress.cardId, cardId),
        ),
      })

      const sm2Input = {
        quality,
        repetitions: existing?.repetitions ?? 0,
        easeFactor: existing?.easeFactor ?? 2.5,
        interval: existing?.interval ?? 0,
      }

      const sm2Output = calculateSM2(sm2Input)

      const values = {
        userId,
        cardId,
        lessonId,
        easeFactor: sm2Output.easeFactor,
        interval: sm2Output.interval,
        repetitions: sm2Output.repetitions,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: sm2Output.nextReviewAt,
        totalReviews: (existing?.totalReviews ?? 0) + 1,
        correctReviews: (existing?.correctReviews ?? 0) + (quality >= 3 ? 1 : 0),
        updatedAt: new Date().toISOString(),
      }

      await db
        .insert(userProgress)
        .values({
          ...values,
          createdAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: [userProgress.userId, userProgress.cardId],
          set: values,
        })
    }

    return { success: true }
  })

/**
 * Get count of cards due for review today
 */
export const getDueCardsCount = createServerFn({ method: 'GET' })
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const userId = context.userId
    const now = new Date().toISOString()

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          sql`${userProgress.nextReviewAt} <= ${now}`,
        ),
      )

    return Number(result[0]?.count ?? 0)
  })

/**
 * Get cards due for review today
 */
export const getDueCards = createServerFn({ method: 'GET' })
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const userId = context.userId
    const now = new Date().toISOString()

    const dueCards = await db
      .select({
        card: cards,
        progress: userProgress,
      })
      .from(userProgress)
      .innerJoin(cards, eq(userProgress.cardId, cards.id))
      .where(
        and(
          eq(userProgress.userId, userId),
          sql`${userProgress.nextReviewAt} <= ${now}`,
        ),
      )
      .limit(50) // Limit to 50 cards per session for focus

    return dueCards.map(item => ({
      ...item.card,
      metadata: (item.card.metadata ?? {}) as object,
      progress: item.progress,
    }))
  })
