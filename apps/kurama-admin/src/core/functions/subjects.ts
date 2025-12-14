import type { CreateSubjectInput, SubjectFilters, UpdateSubjectInput } from '@/lib/schemas'
import { asc, eq, like, sql } from '@kurama/data-ops/database/drizzle-orm'
import { lessons, subjects } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { getDb, initAdminDb } from '@/lib/db'
import {

  createSubjectSchema,

  subjectFiltersSchema,

  updateSubjectSchema,
} from '@/lib/schemas'
import { adminMiddleware } from '../middleware/admin-auth'

// Get all subjects with stats
export const getSubjects = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: SubjectFilters) => subjectFiltersSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()
    const { search, page, limit } = data

    const offset = (page - 1) * limit

    // Build where clause
    const whereClause = search ? like(subjects.name, `%${search}%`) : undefined

    // Get subjects with lesson and card counts
    const subjectList = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        abbreviation: subjects.abbreviation,
        description: subjects.description,
        displayOrder: subjects.displayOrder,
        isActive: subjects.isActive,
        lessonCount: sql<number>`(SELECT COUNT(*) FROM "lessons" WHERE "lessons"."subject_id" = "subjects"."id")`,
        cardCount: sql<number>`(SELECT COUNT(*) FROM "cards" c JOIN "lessons" l ON c."lesson_id" = l."id" WHERE l."subject_id" = "subjects"."id")`,
      })
      .from(subjects)
      .where(whereClause)
      .orderBy(asc(subjects.displayOrder))
      .limit(limit)
      .offset(offset)

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subjects)
      .where(whereClause)

    const count = countResult[0]?.count ?? 0

    return {
      subjects: subjectList,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    }
  })

// Get single subject
export const getSubject = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    initAdminDb()
    const db = getDb()

    const result = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1)

    const subject = result[0]
    if (!subject) {
      throw new Error('Matière non trouvée')
    }

    return subject
  })

// Create subject
export const createSubject = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: CreateSubjectInput) => createSubjectSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    // Get max display order
    const maxOrderResult = await db
      .select({ max: sql<number>`COALESCE(MAX(${subjects.displayOrder}), 0)` })
      .from(subjects)

    const maxOrder = maxOrderResult[0]?.max ?? 0

    const result = await db
      .insert(subjects)
      .values({
        ...data,
        displayOrder: data.displayOrder || (Number(maxOrder) + 1),
      })
      .returning()

    const subject = result[0]
    if (!subject) {
      throw new Error('Erreur lors de la création')
    }

    console.warn(`[AUDIT] Subject created by ${context.email}:`, subject.id)

    return subject
  })

// Update subject
export const updateSubject = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: UpdateSubjectInput) => updateSubjectSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const { id, ...updateData } = data

    const result = await db
      .update(subjects)
      .set(updateData)
      .where(eq(subjects.id, id))
      .returning()

    const subject = result[0]
    if (!subject) {
      throw new Error('Matière non trouvée')
    }

    console.warn(`[AUDIT] Subject updated by ${context.email}:`, id)

    return subject
  })

// Delete subject
export const deleteSubject = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id, context }) => {
    initAdminDb()
    const db = getDb()

    // Check if subject has lessons
    const lessonCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(lessons)
      .where(eq(lessons.subjectId, id))

    const lessonCount = lessonCountResult[0]?.count ?? 0
    if (Number(lessonCount) > 0) {
      throw new Error('Impossible de supprimer une matière avec des leçons')
    }

    const result = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning()

    const deleted = result[0]
    if (!deleted) {
      throw new Error('Matière non trouvée')
    }

    console.warn(`[AUDIT] Subject deleted by ${context.email}:`, id)

    return { success: true }
  })

// Get all subjects for dropdown (simple list)
export const getSubjectsSimple = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    const subjectList = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        abbreviation: subjects.abbreviation,
      })
      .from(subjects)
      .orderBy(asc(subjects.displayOrder))

    return subjectList
  })

// Toggle subject active status
export const toggleSubjectActive = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { id: number; isActive: boolean }) => data)
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const result = await db
      .update(subjects)
      .set({ isActive: data.isActive })
      .where(eq(subjects.id, data.id))
      .returning()

    const subject = result[0]
    if (!subject) {
      throw new Error('Matière non trouvée')
    }

    console.warn(`[AUDIT] Subject ${data.isActive ? 'activated' : 'deactivated'} by ${context.email}:`, data.id)

    return subject
  })

// Reorder subjects
export const reorderSubjects = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: { orderedIds: number[] }) => data)
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    // Update display order for each subject
    for (let i = 0; i < data.orderedIds.length; i++) {
      await db
        .update(subjects)
        .set({ displayOrder: i + 1 })
        .where(eq(subjects.id, data.orderedIds[i]!))
    }

    console.warn(`[AUDIT] Subjects reordered by ${context.email}:`, data.orderedIds)

    return { success: true }
  })
