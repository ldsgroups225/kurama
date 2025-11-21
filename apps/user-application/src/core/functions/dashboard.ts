import { and, eq, gte, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { studySessions, userLessonMastery, userProgress } from '@kurama/data-ops/drizzle/schema'
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
          gte(userProgress.lastReviewedAt, today),
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
    const totalXP = totalCardsStudied * 10 + lessonsCompleted * 100

    // Calculate streak (consecutive days with study sessions)
    const sessionsResult = await db
      .select({
        date: sql<string>`DATE(${studySessions.startedAt})`,
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(sql`DATE(${studySessions.startedAt}) DESC`)
      .limit(365) // Check last year

    const sessionDates = sessionsResult.map(r => r.date)
    const uniqueDates = [...new Set(sessionDates)]

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    if (uniqueDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0]
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      // Check if user studied today or yesterday to maintain streak
      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        currentStreak = 1
        tempStreak = 1

        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDateStr = uniqueDates[i - 1]
          const prevDateStr = uniqueDates[i]
          if (!currentDateStr || !prevDateStr)
            continue

          const currentDate = new Date(currentDateStr)
          const prevDate = new Date(prevDateStr)
          const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / 86400000)

          if (diffDays === 1) {
            currentStreak++
            tempStreak++
          }
          else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
          }
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak, currentStreak)
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
