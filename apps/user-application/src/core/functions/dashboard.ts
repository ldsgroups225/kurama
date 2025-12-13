import { and, desc, eq, gte, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { studySessions, userLessonMastery, userProfiles, userProgress } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

/**
 * Get dashboard statistics for the current user
 */
export const getDashboardStats = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const userId = context.userId

    // Get total cards studied
    const cardsStudiedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))

    const totalCardsStudied = Number(cardsStudiedResult[0]?.count ?? 0)

    // Get cards studied today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const cardsStudiedTodayResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          gte(userProgress.lastReviewedAt, today.toISOString()),
        ),
      )

    const cardsStudiedToday = Number(cardsStudiedTodayResult[0]?.count ?? 0)

    // Get due cards count
    const now = new Date()
    const dueCardsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          sql`${userProgress.nextReviewAt} <= ${now}`,
        ),
      )

    const dueCardsCount = Number(dueCardsResult[0]?.count ?? 0)

    // Calculate XP (simple formula: 10 XP per card reviewed + 100 XP per lesson mastered)
    const masteryResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userLessonMastery)
      .where(
        and(
          eq(userLessonMastery.userId, userId),
          gte(userLessonMastery.successfulTestCount, 2),
        ),
      )

    const lessonsCompleted = Number(masteryResult[0]?.count ?? 0)

    // Get XP from user profile
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    })
    const totalXP = profile?.xp ?? 0

    // Calculate streak (consecutive days with study sessions)
    const sessionsResult = await db
      .select({
        startedAt: studySessions.startedAt,
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.startedAt))

    // Normalize to YYYY-MM-DD (UTC) to ensure consistency
    const uniqueDates = Array.from(new Set(
      sessionsResult.map((s) => {
        const d = new Date(s.startedAt)
        return d.toISOString().split('T')[0] // YYYY-MM-DD
      }),
    ))

    let currentStreak = 0
    let longestStreak = 0

    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      // Calculate Current Streak
      // Check if the most recent study date is today or yesterday
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDateStr = uniqueDates[i - 1]
          const currDateStr = uniqueDates[i]
          if (!prevDateStr || !currDateStr)
            continue

          const prevDate = new Date(prevDateStr)
          const currDate = new Date(currDateStr)
          const diffTime = Math.abs(prevDate.getTime() - currDate.getTime())
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            currentStreak++
          }
          else {
            break // Streak broken
          }
        }
      }

      // Calculate Longest Streak
      let tempStreak = 1
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDateStr = uniqueDates[i - 1]
        const currDateStr = uniqueDates[i]
        if (!prevDateStr || !currDateStr)
          continue

        const prevDate = new Date(prevDateStr)
        const currDate = new Date(currDateStr)
        const diffTime = Math.abs(prevDate.getTime() - currDate.getTime())
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

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

    // Get recent study sessions
    const recentSessions = await db.query.studySessions.findMany({
      where: eq(studySessions.userId, userId),
      orderBy: (sessions, { desc }) => [desc(sessions.startedAt)],
      limit: 5,
      with: {
        lesson: {
          with: {
            subject: true,
          },
        },
      },
    })

    return {
      totalCardsStudied,
      cardsStudiedToday,
      dueCardsCount,
      totalXP,
      currentStreak,
      longestStreak,
      streakHistory: uniqueDates,
      lessonsCompleted,
      recentSessions: recentSessions.map(session => ({
        id: session.id,
        lessonTitle: session.lesson.title,
        subjectName: session.lesson.subject.name,
        cardsReviewed: session.cardsReviewed,
        cardsCorrect: session.cardsCorrect,
        startedAt: session.startedAt,
        duration: session.duration,
      })),
    }
  })
