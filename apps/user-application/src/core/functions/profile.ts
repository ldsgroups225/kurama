import type { UserProfileWithRelations } from '@kurama/data-ops/drizzle/schema'
import { eq } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import {
  grades,
  series,
  userProfiles,

} from '@kurama/data-ops/drizzle/schema'
import { profileSchema } from '@kurama/data-ops/zod-schema/profile'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

/**
 * Get the current user's profile completion status
 */
export const getProfileStatus = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const { userId } = context

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    })

    return {
      isCompleted: profile?.isCompleted ?? false,
      hasProfile: !!profile,
    }
  })

/**
 * Get educational data (grades and series) for form dropdowns
 */
export const getEducationalData = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async () => {
    const db = getDb()

    const [allGrades, allSeries, allLevelSeries] = await Promise.all([
      db.query.grades.findMany({
        where: eq(grades.isActive, true),
        orderBy: (grades, { asc }) => [asc(grades.displayOrder)],
      }),
      db.query.series.findMany({
        orderBy: (series, { asc }) => [asc(series.displayOrder)],
      }),
      db.query.levelSeries.findMany({
        orderBy: (ls, { asc }) => [asc(ls.gradeId)],
        with: {
          grade: {
            columns: {
              name: true,
            },
          },
          series: true,
        },
      }),
    ])

    return {
      grades: allGrades,
      series: allSeries,
      levelSeries: allLevelSeries,
    }
  })

/**
 * Submit/update user profile
 */
export const submitProfile = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => profileSchema.parse(data))
  .handler(async ({ context, data }) => {
    const db = getDb()
    const { userId } = context

    // Data is already validated by the inputValidator
    const validatedData = data

    // Prepare the profile data
    let gradeId: number | null = null
    let seriesId: number | null = null

    // If student, resolve grade and series IDs
    if (validatedData.userType === 'student') {
      // Find grade by name
      const grade = await db.query.grades.findFirst({
        where: eq(grades.name, validatedData.gradeName),
      })

      if (!grade) {
        throw new Error('Niveau invalide')
      }

      gradeId = grade.id

      // Find series by name if provided
      if (validatedData.seriesName) {
        const seriesRecord = await db.query.series.findFirst({
          where: eq(series.name, validatedData.seriesName),
        })

        if (!seriesRecord) {
          throw new Error('Série invalide')
        }

        seriesId = seriesRecord.id
      }
    }

    // Prepare common fields
    const commonFields = {
      userId,
      userType: validatedData.userType,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      isCompleted: true,
    }

    // Prepare student-specific fields
    const studentFields = validatedData.userType === 'student'
      ? {
          phone: validatedData.phone ?? null,
          age: validatedData.age ?? null,
          gender: validatedData.gender ?? null,
          city: validatedData.city ?? null,
          idNumber: validatedData.idNumber ?? null,
          gradeId,
          seriesId,
          favoriteSubjects: validatedData.favoriteSubjects ?? null,
          learningGoals: validatedData.learningGoals ?? null,
          studyTime: validatedData.studyTime ?? null,
          childrenMatricules: null,
        }
      : {
          phone: null,
          age: null,
          gender: null,
          city: null,
          idNumber: null,
          gradeId: null,
          seriesId: null,
          favoriteSubjects: null,
          learningGoals: null,
          studyTime: null,
          childrenMatricules: validatedData.childrenMatricules ?? null,
        }

    // Insert or update profile
    await db
      .insert(userProfiles)
      .values({
        ...commonFields,
        ...studentFields,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          ...commonFields,
          ...studentFields,
          updatedAt: new Date().toISOString(),
        },
      })

    return { success: true }
  })

/**
 * Get current user's profile data
 */
export const getUserProfile = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }): Promise<UserProfileWithRelations | undefined> => {
    const db = getDb()
    const { userId } = context

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
      with: {
        grade: true,
        series: true,
      },
    })

    return profile
  })
