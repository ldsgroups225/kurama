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

/**
 * Get profile stats for display (XP, level, streak, cards studied)
 */
export const getProfileStats = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const { getDb: getDatabase } = await import('@kurama/data-ops/database/setup')
    const { userProfiles, userProgress, studySessions } = await import('@kurama/data-ops/drizzle/schema')
    const { eq, desc, sql } = await import('@kurama/data-ops/database/drizzle-orm')

    const db = getDatabase()
    const { userId } = context

    // Get user profile with grade
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
      with: {
        grade: true,
      },
    })

    const totalXP = profile?.xp ?? 0

    // Calculate level from XP
    const LEVEL_THRESHOLDS = [
      0,
      100,
      250,
      500,
      800,
      1200,
      1700,
      2300,
      3000,
      3800,
      4700,
      5700,
      6800,
      8000,
      9300,
      10700,
      12200,
      13800,
      15500,
      17300,
    ]

    let level = 1
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXP >= (LEVEL_THRESHOLDS[i] ?? 0)) {
        level = i + 1
        break
      }
    }

    // Get total cards studied by user
    const cardsStudiedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))

    const totalCardsStudied = Number(cardsStudiedResult[0]?.count ?? 0)

    // Calculate current streak
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
    }

    return {
      totalXP,
      level,
      totalCardsStudied,
      currentStreak,
      gradeName: profile?.grade?.name ?? null,
    }
  })
