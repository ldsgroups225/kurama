import { and, asc, eq, lt, or, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, lessons, subjects, userProgress } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

/**
 * Card with review status for quick review sessions
 */
export interface ReviewCard {
  id: number
  lessonId: number
  frontContent: string
  backContent: string
  cardType: string
  displayOrder: number
  lessonTitle: string
  subjectName: string
  subjectId: number
  // Progress info
  easeFactor: number
  interval: number
  repetitions: number
  totalReviews: number
  correctReviews: number
  lastReviewedAt: string | null
  nextReviewAt: string | null
}

/**
 * Get cards that need review - mistakes and unknown cards
 * Criteria:
 * - Cards with low ease factor (< 2.5, indicating difficulty)
 * - Cards with low correct rate (< 70%)
 * - Cards due for review (nextReviewAt <= now)
 * - Cards never reviewed (new cards)
 */
export const getCardsForReview = createServerFn({ method: 'GET' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: { limit?: number } | undefined) => data ?? { limit: 20 })
  .handler(async ({ data, context }) => {
    const db = getDb()
    const userId = context.userId
    const limit = data.limit ?? 20
    const now = new Date().toISOString()

    // Get cards that need review with their progress
    const reviewCardsWithProgress = await db
      .select({
        cardId: cards.id,
        lessonId: cards.lessonId,
        frontContent: cards.frontContent,
        backContent: cards.backContent,
        cardType: cards.cardType,
        displayOrder: cards.displayOrder,
        lessonTitle: lessons.title,
        subjectName: subjects.name,
        subjectId: subjects.id,
        easeFactor: userProgress.easeFactor,
        interval: userProgress.interval,
        repetitions: userProgress.repetitions,
        totalReviews: userProgress.totalReviews,
        correctReviews: userProgress.correctReviews,
        lastReviewedAt: userProgress.lastReviewedAt,
        nextReviewAt: userProgress.nextReviewAt,
      })
      .from(userProgress)
      .innerJoin(cards, eq(userProgress.cardId, cards.id))
      .innerJoin(lessons, eq(cards.lessonId, lessons.id))
      .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(
        and(
          eq(userProgress.userId, userId),
          or(
            // Low ease factor (struggling cards) - ease factor stored as integer * 1000
            lt(userProgress.easeFactor, 2500),
            // Due for review
            sql`${userProgress.nextReviewAt} <= ${now}`,
            // Low accuracy (less than 70% correct)
            sql`CASE WHEN ${userProgress.totalReviews} > 0 
                THEN (${userProgress.correctReviews}::float / ${userProgress.totalReviews}::float) < 0.7 
                ELSE false END`,
          ),
        ),
      )
      .orderBy(
        // Prioritize: due cards first, then by ease factor (lowest first)
        asc(userProgress.easeFactor),
        asc(userProgress.nextReviewAt),
      )
      .limit(limit)

    const reviewCards: ReviewCard[] = reviewCardsWithProgress.map(row => ({
      id: row.cardId,
      lessonId: row.lessonId,
      frontContent: row.frontContent,
      backContent: row.backContent,
      cardType: row.cardType,
      displayOrder: row.displayOrder,
      lessonTitle: row.lessonTitle,
      subjectName: row.subjectName,
      subjectId: row.subjectId,
      easeFactor: row.easeFactor,
      interval: row.interval,
      repetitions: row.repetitions,
      totalReviews: row.totalReviews,
      correctReviews: row.correctReviews,
      lastReviewedAt: row.lastReviewedAt,
      nextReviewAt: row.nextReviewAt,
    }))

    return {
      cards: reviewCards,
      totalCount: reviewCards.length,
      hasMore: reviewCards.length === limit,
    }
  })

/**
 * Get count of cards needing review for dashboard display
 */
export const getReviewCardsCount = createServerFn({ method: 'GET' })
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const userId = context.userId
    const now = new Date().toISOString()

    // Count cards needing review
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          or(
            lt(userProgress.easeFactor, 2500),
            sql`${userProgress.nextReviewAt} <= ${now}`,
            sql`CASE WHEN ${userProgress.totalReviews} > 0 
                THEN (${userProgress.correctReviews}::float / ${userProgress.totalReviews}::float) < 0.7 
                ELSE false END`,
          ),
        ),
      )

    return {
      count: Number(result[0]?.count ?? 0),
    }
  })
