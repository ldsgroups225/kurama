import { and, desc, eq, gte, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, studySessions, userLessonMastery, userProfiles, userProgress } from '@kurama/data-ops/drizzle/schema'
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

    // Calculate streak
    const sessionsResult = await db
      .select({ startedAt: studySessions.startedAt })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.startedAt))

    const uniqueDates = Array.from(new Set(
      sessionsResult.map((s) => {
        const d = new Date(s.startedAt)
        return d.toISOString().split('T')[0]
      }),
    ))

    let currentStreak = 0
    let longestStreak = 0

    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDateStr = uniqueDates[i - 1]
          const currDateStr = uniqueDates[i]
          if (!prevDateStr || !currDateStr)
            continue

          const prevDate = new Date(prevDateStr)
          const currDate = new Date(currDateStr)
          const diffDays = Math.round(Math.abs(prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            currentStreak++
          }
          else {
            break
          }
        }
      }

      let tempStreak = 1
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDateStr = uniqueDates[i - 1]
        const currDateStr = uniqueDates[i]
        if (!prevDateStr || !currDateStr)
          continue

        const prevDate = new Date(prevDateStr)
        const currDate = new Date(currDateStr)
        const diffDays = Math.round(Math.abs(prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          tempStreak++
        }
        else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

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

    // Get weekly activity data (last 7 days)
    const weeklyActivity: { day: string, cardsStudied: number, date: string }[] = []
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0] ?? ''
      const dayName = dayNames[date.getDay()] ?? 'D'

      // Count cards studied on this day
      const dayStart = new Date(dateStr)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dateStr)
      dayEnd.setHours(23, 59, 59, 999)

      const dayCardsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            gte(userProgress.lastReviewedAt, dayStart.toISOString()),
            sql`${userProgress.lastReviewedAt} <= ${dayEnd.toISOString()}`,
          ),
        )

      weeklyActivity.push({
        day: dayName,
        cardsStudied: Number(dayCardsResult[0]?.count ?? 0),
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
    }
  })
