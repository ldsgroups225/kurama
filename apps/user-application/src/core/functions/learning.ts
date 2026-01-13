import { and, asc, eq, inArray } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, lessons, studySessions, subjects, userLessonMastery } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'
import { getUserGradeId } from './utils'

/**
 * Get all active subjects for the subject selection screen
 */
export const getSubjects = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async () => {
    const db = getDb()

    return db.query.subjects.findMany({
      where: eq(subjects.isActive, true),
      orderBy: [asc(subjects.displayOrder)],
    })
  })

/**
 * Get lessons for a specific subject with lock status and mastery progress
 * and filters lessons by user's grade level
 */
export const getLessonsBySubject = createServerFn({ method: 'GET' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: number) => {
    if (typeof data !== 'number' || Number.isNaN(data)) {
      throw new TypeError('Invalid input: subjectId must be a number')
    }
    return data
  })
  .handler(async ({ data: subjectId, context }) => {
    const db = getDb()
    const userId = context.userId

    // Get user's grade ID
    const userGradeId = await getUserGradeId(db, userId)

    // If user doesn't have a grade assigned, return empty array
    // This prevents access to any lessons without proper grade assignment
    if (!userGradeId) {
      console.warn(`User ${userId} attempting to access lessons without grade assignment`)
      return []
    }

    // Fetch published lessons for the subject AND user's grade, ordered by displayOrder
    const lessonsData = await db.query.lessons.findMany({
      where: and(
        eq(lessons.subjectId, subjectId),
        eq(lessons.isPublished, true),
        eq(lessons.gradeId, userGradeId),
      ),
      orderBy: [asc(lessons.displayOrder)],
      with: {
        subject: true,
      },
    })

    if (lessonsData.length === 0) {
      return []
    }

    // Fetch mastery records for all lessons
    const lessonIds = lessonsData.map(l => l.id)
    const masteryRecords = await db.query.userLessonMastery.findMany({
      where: and(
        eq(userLessonMastery.userId, userId),
        inArray(userLessonMastery.lessonId, lessonIds),
      ),
    })

    // Create a map for quick lookup
    const masteryMap = new Map(
      masteryRecords.map(m => [m.lessonId, m]),
    )

    // Calculate lock status for each lesson
    const lessonsWithStatus = lessonsData.map((lesson, index) => {
      const mastery = masteryMap.get(lesson.id)
      const masteryCount = mastery?.successfulTestCount ?? 0
      const isCompleted = masteryCount >= 2

      // First lesson is always unlocked
      let isLocked = false
      if (index > 0) {
        // Check if previous lesson has been mastered
        const previousLesson = lessonsData[index - 1]
        if (previousLesson) {
          const previousMastery = masteryMap.get(previousLesson.id)
          const previousMasteryCount = previousMastery?.successfulTestCount ?? 0
          isLocked = previousMasteryCount < 2
        }
      }

      return {
        ...lesson,
        isLocked,
        masteryCount,
        isCompleted,
        lastTestScore: mastery?.lastTestScore ?? null,
      }
    })

    return lessonsWithStatus
  })

/**
 * Get a single lesson with all its cards for the learning session
 * and validates that lesson belongs to user's grade level
 */
export const getLessonDetails = createServerFn({ method: 'GET' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: number) => {
    if (typeof data !== 'number' || Number.isNaN(data)) {
      throw new TypeError('Invalid input: lessonId must be a number')
    }
    return data
  })
  .handler(async ({ data: lessonId, context }) => {
    const db = getDb()
    const userId = context.userId

    // Get user's grade ID
    const userGradeId = await getUserGradeId(db, userId)

    // If user doesn't have a grade assigned, deny access
    if (!userGradeId) {
      throw new Error('Access denied: User grade not assigned')
    }

    const lesson = await db.query.lessons.findFirst({
      where: and(
        eq(lessons.id, lessonId),
        eq(lessons.isPublished, true),
        eq(lessons.gradeId, userGradeId),
      ),
      with: {
        subject: true,
        cards: {
          orderBy: [asc(cards.displayOrder)],
        },
      },
    })

    if (!lesson) {
      throw new Error('Lesson not found or access denied')
    }

    // Type assertion to handle metadata field (json type defaults to unknown)
    return {
      ...lesson,
      cards: lesson.cards.map(card => ({
        ...card,
        metadata: (card.metadata ?? {}) as object,
      })),
    }
  })

/**
 * Submit test result and update mastery progress
 * and validates that lesson belongs to user's grade level
 */
export const submitTestResult = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: { lessonId: number, correctCount: number, totalCount: number }) => {
    if (typeof data.lessonId !== 'number' || Number.isNaN(data.lessonId)) {
      throw new TypeError('Invalid input: lessonId must be a number')
    }
    if (typeof data.correctCount !== 'number' || typeof data.totalCount !== 'number') {
      throw new TypeError('Invalid input: correctCount and totalCount must be numbers')
    }
    return data
  })
  .handler(async ({ data, context }) => {
    const db = getDb()
    const userId = context.userId
    const { lessonId, correctCount, totalCount } = data

    // Get user's grade ID
    const userGradeId = await getUserGradeId(db, userId)

    // If user doesn't have a grade assigned, deny access
    if (!userGradeId) {
      throw new Error('Access denied: User grade not assigned')
    }

    // Validate that the lesson belongs to user's grade
    const lesson = await db.query.lessons.findFirst({
      where: and(
        eq(lessons.id, lessonId),
        eq(lessons.isPublished, true),
        eq(lessons.gradeId, userGradeId),
      ),
      columns: { id: true, subjectId: true, displayOrder: true },
    })

    if (!lesson) {
      throw new Error('Lesson not found or access denied')
    }

    // Calculate percentage
    const percentage = Math.round((correctCount / totalCount) * 100)
    const isPassing = percentage >= 80
    // Note: XP is now awarded via updateSessionStats in stats.ts for comprehensive tracking

    // Get or create mastery record
    const existingMastery = await db.query.userLessonMastery.findFirst({
      where: and(
        eq(userLessonMastery.userId, userId),
        eq(userLessonMastery.lessonId, lessonId),
      ),
    })

    let newMasteryCount = 0
    let wasUnlocked = false

    if (existingMastery) {
      // Update existing record
      const newCount = isPassing ? existingMastery.successfulTestCount + 1 : existingMastery.successfulTestCount
      newMasteryCount = newCount

      await db
        .update(userLessonMastery)
        .set({
          successfulTestCount: newCount,
          lastTestScore: percentage,
          lastTestAt: new Date().toISOString(),
          isUnlocked: newCount >= 2,
        })
        .where(
          and(
            eq(userLessonMastery.userId, userId),
            eq(userLessonMastery.lessonId, lessonId),
          ),
        )

      wasUnlocked = newCount >= 2 && existingMastery.successfulTestCount < 2
    }
    else {
      // Create new record
      newMasteryCount = isPassing ? 1 : 0

      await db.insert(userLessonMastery).values({
        userId,
        lessonId,
        successfulTestCount: newMasteryCount,
        lastTestScore: percentage,
        lastTestAt: new Date().toISOString(),
        isUnlocked: newMasteryCount >= 2,
      })
    }

    // Check if next lesson should be unlocked (only within same grade)
    const currentLesson = await db.query.lessons.findFirst({
      where: and(
        eq(lessons.id, lessonId),
        eq(lessons.isPublished, true),
        eq(lessons.gradeId, userGradeId),
      ),
    })

    let nextLessonUnlocked = false
    let nextLessonTitle: string | null = null

    if (currentLesson && newMasteryCount >= 2) {
      // Find next lesson in sequence (within same grade)
      const nextLesson = await db.query.lessons.findFirst({
        where: and(
          eq(lessons.subjectId, currentLesson.subjectId),
          eq(lessons.displayOrder, currentLesson.displayOrder + 1),
          eq(lessons.isPublished, true),
          eq(lessons.gradeId, userGradeId),
        ),
      })

      if (nextLesson) {
        nextLessonUnlocked = wasUnlocked
        nextLessonTitle = nextLesson.title
      }
    }

    return {
      percentage,
      isPassing,
      masteryCount: newMasteryCount,
      masteryRequired: 2,
      isCompleted: newMasteryCount >= 2,
      nextLessonUnlocked,
      nextLessonTitle,
    }
  })

/**
 * Initialize a study session (lesson or subject level)
 */
export const startStudySession = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: { lessonId?: number, subjectId?: number, mode: string }) => {
    if (!data.lessonId && !data.subjectId) {
      throw new Error('Either lessonId or subjectId is required')
    }
    return data
  })
  .handler(async ({ data, context }) => {
    const db = getDb()
    const userId = context.userId
    const { lessonId, subjectId, mode } = data

    const [session] = await db.insert(studySessions).values({
      userId,
      lessonId: lessonId ?? null,
      subjectId: subjectId ?? null,
      mode,
      startedAt: new Date().toISOString(),
      cardsReviewed: 0,
      cardsCorrect: 0,
    }).returning({ id: studySessions.id })

    if (!session) {
      throw new Error('Failed to create study session')
    }

    return { sessionId: session.id }
  })
