import { createServerFn } from '@tanstack/react-start'
import { eq, sql, asc } from '@kurama/data-ops/database/drizzle-orm'
import { grades, series, levelSeries } from '@kurama/data-ops/drizzle/schema'
import { adminMiddleware } from '../middleware/admin-auth'
import { initAdminDb, getDb } from '@/lib/db'
import { z } from 'zod'

// Schemas
const updateGradeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
})

const updateSeriesSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
})

const toggleLevelSeriesSchema = z.object({
  gradeId: z.number().int().positive(),
  seriesId: z.number().int().positive(),
  enabled: z.boolean(),
})

export type UpdateGradeInput = z.infer<typeof updateGradeSchema>
export type UpdateSeriesInput = z.infer<typeof updateSeriesSchema>
export type ToggleLevelSeriesInput = z.infer<typeof toggleLevelSeriesSchema>

// Get all grades with lesson counts
export const getGrades = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    const gradeList = await db
      .select({
        id: grades.id,
        name: grades.name,
        slug: grades.slug,
        category: grades.category,
        isActive: grades.isActive,
        displayOrder: grades.displayOrder,
        lessonCount: sql<number>`(SELECT COUNT(*) FROM "lessons" WHERE "lessons"."grade_id" = "grades"."id")`,
      })
      .from(grades)
      .orderBy(asc(grades.displayOrder))

    return gradeList
  })

// Get all series with lesson counts
export const getSeries = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    const seriesList = await db
      .select({
        id: series.id,
        name: series.name,
        description: series.description,
        displayOrder: series.displayOrder,
        lessonCount: sql<number>`(SELECT COUNT(*) FROM "lessons" WHERE "lessons"."series_id" = "series"."id")`,
      })
      .from(series)
      .orderBy(asc(series.displayOrder))

    return seriesList
  })

// Get level-series mappings (which series are available for which grades)
export const getLevelSeriesMappings = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    const mappings = await db
      .select({
        gradeId: levelSeries.gradeId,
        seriesId: levelSeries.seriesId,
      })
      .from(levelSeries)

    return mappings
  })

// Update grade
export const updateGrade = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: UpdateGradeInput) => updateGradeSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const { id, ...updateData } = data

    const result = await db
      .update(grades)
      .set(updateData)
      .where(eq(grades.id, id))
      .returning()

    const grade = result[0]
    if (!grade) {
      throw new Error('Niveau non trouvé')
    }

    console.log(`[AUDIT] Grade updated by ${context.email}:`, id)
    return grade
  })

// Toggle grade active status
export const toggleGradeActive = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id, context }) => {
    initAdminDb()
    const db = getDb()

    // Get current status
    const currentResult = await db
      .select({ isActive: grades.isActive })
      .from(grades)
      .where(eq(grades.id, id))

    const current = currentResult[0]
    if (!current) {
      throw new Error('Niveau non trouvé')
    }

    const newStatus = !current.isActive

    const result = await db
      .update(grades)
      .set({ isActive: newStatus })
      .where(eq(grades.id, id))
      .returning()

    console.log(`[AUDIT] Grade ${newStatus ? 'activated' : 'deactivated'} by ${context.email}:`, id)
    return result[0]
  })

// Update series
export const updateSeries = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: UpdateSeriesInput) => updateSeriesSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const { id, ...updateData } = data

    const result = await db
      .update(series)
      .set(updateData)
      .where(eq(series.id, id))
      .returning()

    const s = result[0]
    if (!s) {
      throw new Error('Série non trouvée')
    }

    console.log(`[AUDIT] Series updated by ${context.email}:`, id)
    return s
  })

// Toggle level-series mapping
export const toggleLevelSeries = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: ToggleLevelSeriesInput) => toggleLevelSeriesSchema.parse(data))
  .handler(async ({ data, context }) => {
    initAdminDb()
    const db = getDb()

    const { gradeId, seriesId, enabled } = data

    if (enabled) {
      // Add mapping
      await db
        .insert(levelSeries)
        .values({ gradeId, seriesId })
        .onConflictDoNothing()
    } else {
      // Remove mapping
      await db
        .delete(levelSeries)
        .where(
          sql`${levelSeries.gradeId} = ${gradeId} AND ${levelSeries.seriesId} = ${seriesId}`
        )
    }

    console.log(`[AUDIT] Level-series mapping ${enabled ? 'added' : 'removed'} by ${context.email}: grade=${gradeId}, series=${seriesId}`)
    return { success: true }
  })
