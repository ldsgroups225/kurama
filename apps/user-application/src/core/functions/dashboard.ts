import { and, desc, eq, gte, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import {
  lessons,
  studySessions,
  subjects,
  userLessonMastery,
  userProfiles,
  userProgress,
} from '@kurama/data-ops/drizzle/schema'
import { getStreakData } from '@kurama/data-ops/queries/streak'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'
import { getUserGradeId } from './utils'

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
          sql`${userProgress.nextReviewAt} <= ${now} `,
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

    // Calculate streak using shared utility (eliminates code duplication)
    // This uses consistent timezone handling (Africa/Abidjan) and optimized queries
    const streakData = await getStreakData(db, userId)
    const { currentStreak, longestStreak, streakHistory: uniqueDates } = streakData

    // Get recent study sessions (filtered by user's grade)
    const userGradeId = await getUserGradeId(db, userId)

    let recentSessions: any[] = []
    if (userGradeId) {
      // Only get sessions for lessons belonging to user's grade
      const sessionsData = await db
        .select({
          session: studySessions,
          lesson: lessons,
          subject: subjects,
        })
        .from(studySessions)
        .innerJoin(lessons, eq(studySessions.lessonId, lessons.id))
        .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
        .where(
          and(
            eq(studySessions.userId, userId),
            eq(lessons.gradeId, userGradeId),
          ),
        )
        .orderBy(desc(studySessions.startedAt))
        .limit(5)

      recentSessions = sessionsData.map(d => ({
        ...d.session,
        lesson: {
          ...d.lesson,
          subject: d.subject,
        },
      }))
    }

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
