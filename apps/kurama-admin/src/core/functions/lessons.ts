import type { CreateLessonInput, LessonFilters, UpdateLessonInput } from '@/lib/schemas'
import { and, asc, eq, like, sql } from '@kurama/data-ops/database/drizzle-orm'
import { cards, grades, lessons, series, subjects } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { getDb, initAdminDb } from '@/lib/db'
import {

  createLessonSchema,

  lessonFiltersSchema,

  updateLessonSchema,
} from '@/lib/schemas'
import { adminMiddleware } from '../middleware/admin-auth'

// Get lessons with filters
export const getLessons = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: LessonFilters) => lessonFiltersSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()
    const { subjectId, isPublished, hasTeachPlan, search, page, limit } = data

    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = []
    if (subjectId)
      conditions.push(eq(lessons.subjectId, subjectId))
    if (isPublished !== undefined)
      conditions.push(eq(lessons.isPublished, isPublished))
    if (hasTeachPlan !== undefined) {
      if (hasTeachPlan) {
        conditions.push(sql`${lessons.teachPlan} IS NOT NULL`)
      }
      else {
        conditions.push(sql`${lessons.teachPlan} IS NULL`)
      }
    }
    if (data.hasCards !== undefined) {
      if (data.hasCards) {
        conditions.push(sql`(SELECT COUNT(*) FROM "cards" WHERE "cards"."lesson_id" = "lessons"."id") > 0`)
      }
      else {
        conditions.push(sql`(SELECT COUNT(*) FROM "cards" WHERE "cards"."lesson_id" = "lessons"."id") = 0`)
      }
    }
    if (search)
      conditions.push(like(lessons.title, `%${search}%`))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get lessons with subject, grade, series info and card count
    // Order by grade, then series, then displayOrder
    const lessonList = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        difficulty: lessons.difficulty,
        estimatedDuration: lessons.estimatedDuration,
        isPublished: lessons.isPublished,
        publishedAt: lessons.publishedAt,
        displayOrder: lessons.displayOrder,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
        subjectId: lessons.subjectId,
        subjectName: subjects.name,
        subjectAbbreviation: subjects.abbreviation,
        gradeId: lessons.gradeId,
        gradeName: grades.name,
        seriesId: lessons.seriesId,
        seriesName: series.name,
        cardCount: sql<number>`(SELECT COUNT(*) FROM "cards" WHERE "cards"."lesson_id" = "lessons"."id")`,
        hasTeachPlan: sql<boolean>`"lessons"."teach_plan" IS NOT NULL`,
      })
      .from(lessons)
      .leftJoin(subjects, eq(lessons.subjectId, subjects.id))
      .leftJoin(grades, eq(lessons.gradeId, grades.id))
      .leftJoin(series, eq(lessons.seriesId, series.id))
      .where(whereClause)
      .orderBy(asc(grades.displayOrder), asc(series.displayOrder), asc(lessons.displayOrder))
      .limit(limit)
      .offset(offset)

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(lessons)
      .where(whereClause)

    const count = countResult[0]?.count ?? 0

    return {
      lessons: lessonList,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    }
  })

// Get single lesson
export const getLesson = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    initAdminDb()
    const db = getDb()

    const result = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        difficulty: lessons.difficulty,
        estimatedDuration: lessons.estimatedDuration,
        isPublished: lessons.isPublished,
        publishedAt: lessons.publishedAt,
        displayOrder: lessons.displayOrder,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
        subjectId: lessons.subjectId,
        subjectName: subjects.name,
        gradeId: lessons.gradeId,
        gradeName: grades.name,
        seriesId: lessons.seriesId,
        seriesName: series.name,
        teachPlan: lessons.teachPlan,
        teachPlanGeneratedAt: lessons.teachPlanGeneratedAt,
        teachPlanMetadata: lessons.teachPlanMetadata,
      })
      .from(lessons)
      .leftJoin(subjects, eq(lessons.subjectId, subjects.id))
      .leftJoin(grades, eq(lessons.gradeId, grades.id))
      .leftJoin(series, eq(lessons.seriesId, series.id))
      .where(eq(lessons.id, id))
      .limit(1)

    const lesson = result[0]
    if (!lesson) {
      throw new Error('Leçon non trouvée')
    }

    return lesson
  })

// Create lesson
export const createLesson = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: CreateLessonInput) => createLessonSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    // Get max display order for this subject
    const maxOrderResult = await db
      .select({ max: sql<number>`COALESCE(MAX(${lessons.displayOrder}), 0)` })
      .from(lessons)
      .where(eq(lessons.subjectId, data.subjectId))

    const maxOrder = maxOrderResult[0]?.max ?? 0

    const result = await db
      .insert(lessons)
      .values({
        ...data,
        gradeId: data.gradeId || null,
        seriesId: data.seriesId || null,
        displayOrder: data.displayOrder || (Number(maxOrder) + 1),
        authorId: context.userId,
        publishedAt: data.isPublished ? new Date().toISOString() : null,
      })
      .returning()

    const lesson = result[0]
    if (!lesson) {
      throw new Error('Erreur lors de la création')
    }

    console.warn(`[AUDIT] Lesson created by ${context.email}:`, lesson.id)

    return lesson
  })

// Update lesson
export const updateLesson = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: UpdateLessonInput) => updateLessonSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const { id, ...updateData } = data

    // Get current lesson to check publish status change
    const currentResult = await db
      .select({ isPublished: lessons.isPublished })
      .from(lessons)
      .where(eq(lessons.id, id))

    const current = currentResult[0]
    const publishedAt = updateData.isPublished && !current?.isPublished
      ? new Date().toISOString()
      : undefined

    const result = await db
      .update(lessons)
      .set({
        ...updateData,
        ...(publishedAt && { publishedAt }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, id))
      .returning()

    const lesson = result[0]
    if (!lesson) {
      throw new Error('Leçon non trouvée')
    }

    console.warn(`[AUDIT] Lesson updated by ${context.email}:`, id)

    return lesson
  })

// Toggle publish status
export const toggleLessonPublish = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id, context }) => {
    initAdminDb()
    const db = getDb()

    // Get current status
    const currentResult = await db
      .select({ isPublished: lessons.isPublished })
      .from(lessons)
      .where(eq(lessons.id, id))

    const current = currentResult[0]
    if (!current) {
      throw new Error('Leçon non trouvée')
    }

    const newStatus = !current.isPublished

    const result = await db
      .update(lessons)
      .set({
        isPublished: newStatus,
        publishedAt: newStatus ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, id))
      .returning()

    const lesson = result[0]
    console.warn(`[AUDIT] Lesson ${newStatus ? 'published' : 'unpublished'} by ${context.email}:`, id)

    return lesson
  })

// Delete lesson
export const deleteLesson = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id, context }) => {
    initAdminDb()
    const db = getDb()

    // Check if lesson has cards
    const cardCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(cards)
      .where(eq(cards.lessonId, id))

    const cardCount = cardCountResult[0]?.count ?? 0
    if (Number(cardCount) > 0) {
      throw new Error('Impossible de supprimer une leçon avec des cartes')
    }

    const result = await db
      .delete(lessons)
      .where(eq(lessons.id, id))
      .returning()

    const deleted = result[0]
    if (!deleted) {
      throw new Error('Leçon non trouvée')
    }

    console.warn(`[AUDIT] Lesson deleted by ${context.email}:`, id)

    return { success: true }
  })

// Bulk delete lessons
export const bulkDeleteLessons = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((ids: number[]) => ids)
  .handler(async ({ data: ids, context }) => {
    initAdminDb()
    const db = getDb()

    // Check if any lesson has cards
    const lessonsWithCards = await db
      .select({ id: lessons.id, cardCount: sql<number>`(SELECT COUNT(*) FROM "cards" WHERE "cards"."lesson_id" = "lessons"."id")` })
      .from(lessons)
      .where(sql`${lessons.id} IN ${ids}`)

    const hasCards = lessonsWithCards.filter(l => Number(l.cardCount) > 0)
    if (hasCards.length > 0) {
      throw new Error(`${hasCards.length} leçon(s) ont des cartes et ne peuvent pas être supprimées`)
    }

    const result = await db
      .delete(lessons)
      .where(sql`${lessons.id} IN ${ids}`)
      .returning({ id: lessons.id })

    console.warn(`[AUDIT] Bulk delete lessons by ${context.email}:`, ids)

    return { deleted: result.length }
  })

// Bulk publish/unpublish lessons
export const bulkToggleLessonsPublish = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { ids: number[], isPublished: boolean }) => data)
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const { ids, isPublished } = data

    const result = await db
      .update(lessons)
      .set({
        isPublished,
        publishedAt: isPublished ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .where(sql`${lessons.id} IN ${ids}`)
      .returning({ id: lessons.id })

    console.warn(`[AUDIT] Bulk ${isPublished ? 'publish' : 'unpublish'} lessons by ${context.email}:`, ids)

    return { updated: result.length }
  })

// Reorder lessons
export const reorderLessons = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { lessonId: number, newOrder: number }) => data)
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const { lessonId, newOrder } = data

    // Get current lesson
    const currentResult = await db
      .select({
        id: lessons.id,
        displayOrder: lessons.displayOrder,
        subjectId: lessons.subjectId,
        gradeId: lessons.gradeId,
      })
      .from(lessons)
      .where(eq(lessons.id, lessonId))

    const current = currentResult[0]
    if (!current) {
      throw new Error('Leçon non trouvée')
    }

    const oldOrder = current.displayOrder

    if (oldOrder === newOrder) {
      return { success: true }
    }

    // Update orders for affected lessons
    if (newOrder > oldOrder) {
      // Moving down: decrease order of lessons between old and new position
      await db
        .update(lessons)
        .set({
          displayOrder: sql`${lessons.displayOrder} - 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(lessons.subjectId, current.subjectId),
            sql`${lessons.displayOrder} > ${oldOrder}`,
            sql`${lessons.displayOrder} <= ${newOrder}`,
          ),
        )
    }
    else {
      // Moving up: increase order of lessons between new and old position
      await db
        .update(lessons)
        .set({
          displayOrder: sql`${lessons.displayOrder} + 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(lessons.subjectId, current.subjectId),
            sql`${lessons.displayOrder} >= ${newOrder}`,
            sql`${lessons.displayOrder} < ${oldOrder}`,
          ),
        )
    }

    // Update the moved lesson
    await db
      .update(lessons)
      .set({
        displayOrder: newOrder,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessons.id, lessonId))

    console.warn(`[AUDIT] Lesson reordered by ${context.email}: ${lessonId} from ${oldOrder} to ${newOrder}`)

    return { success: true }
  })
