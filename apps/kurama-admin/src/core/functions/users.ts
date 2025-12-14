import type { UserFilters } from '@/lib/schemas'
import { and, desc, eq, like, or, sql } from '@kurama/data-ops/database/drizzle-orm'
import { authUser, grades, series, studySessions, userProfiles } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { getDb, initAdminDb } from '@/lib/db'
import { userFiltersSchema } from '@/lib/schemas'
import { adminMiddleware } from '../middleware/admin-auth'

// Get users with filters
export const getUsers = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: UserFilters) => userFiltersSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()
    const { search, userType, gradeId, isCompleted, page, limit } = data

    const offset = (page - 1) * limit

    // Build where conditions for profiles
    const profileConditions = []
    if (userType)
      profileConditions.push(eq(userProfiles.userType, userType))
    if (gradeId)
      profileConditions.push(eq(userProfiles.gradeId, gradeId))
    if (isCompleted !== undefined)
      profileConditions.push(eq(userProfiles.isCompleted, isCompleted))

    // Build where conditions for users (search)
    const userConditions = []
    if (search) {
      userConditions.push(
        or(
          like(authUser.name, `%${search}%`),
          like(authUser.email, `%${search}%`),
        ),
      )
    }

    // Get users with profiles
    const users = await db
      .select({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        image: authUser.image,
        createdAt: authUser.createdAt,
        profile: {
          userType: userProfiles.userType,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          phone: userProfiles.phone,
          age: userProfiles.age,
          gender: userProfiles.gender,
          city: userProfiles.city,
          gradeId: userProfiles.gradeId,
          seriesId: userProfiles.seriesId,
          xp: userProfiles.xp,
          isCompleted: userProfiles.isCompleted,
        },
        gradeName: grades.name,
        seriesName: series.name,
      })
      .from(authUser)
      .leftJoin(userProfiles, eq(authUser.id, userProfiles.userId))
      .leftJoin(grades, eq(userProfiles.gradeId, grades.id))
      .leftJoin(series, eq(userProfiles.seriesId, series.id))
      .where(
        and(
          ...(userConditions.length > 0 ? userConditions : []),
          ...(profileConditions.length > 0 ? profileConditions : []),
        ),
      )
      .orderBy(desc(authUser.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(authUser)
      .leftJoin(userProfiles, eq(authUser.id, userProfiles.userId))
      .where(
        and(
          ...(userConditions.length > 0 ? userConditions : []),
          ...(profileConditions.length > 0 ? profileConditions : []),
        ),
      )

    const count = countResult[0]?.count ?? 0

    return {
      users,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    }
  })

// Get single user with full details
export const getUser = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    initAdminDb()
    const db = getDb()

    const result = await db
      .select({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        image: authUser.image,
        createdAt: authUser.createdAt,
        updatedAt: authUser.updatedAt,
        profile: {
          userType: userProfiles.userType,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          phone: userProfiles.phone,
          age: userProfiles.age,
          gender: userProfiles.gender,
          city: userProfiles.city,
          idNumber: userProfiles.idNumber,
          gradeId: userProfiles.gradeId,
          seriesId: userProfiles.seriesId,
          favoriteSubjects: userProfiles.favoriteSubjects,
          learningGoals: userProfiles.learningGoals,
          studyTime: userProfiles.studyTime,
          childrenMatricules: userProfiles.childrenMatricules,
          xp: userProfiles.xp,
          isCompleted: userProfiles.isCompleted,
          createdAt: userProfiles.createdAt,
          updatedAt: userProfiles.updatedAt,
        },
        gradeName: grades.name,
        seriesName: series.name,
      })
      .from(authUser)
      .leftJoin(userProfiles, eq(authUser.id, userProfiles.userId))
      .leftJoin(grades, eq(userProfiles.gradeId, grades.id))
      .leftJoin(series, eq(userProfiles.seriesId, series.id))
      .where(eq(authUser.id, id))
      .limit(1)

    const user = result[0]
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    return user
  })

// Get user learning statistics
export const getUserStats = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    initAdminDb()
    const db = getDb()

    // Get study sessions stats
    const sessionsResult = await db
      .select({
        totalSessions: sql<number>`COUNT(*)`,
        totalCardsReviewed: sql<number>`COALESCE(SUM(${studySessions.cardsReviewed}), 0)`,
        totalCardsCorrect: sql<number>`COALESCE(SUM(${studySessions.cardsCorrect}), 0)`,
        totalDuration: sql<number>`COALESCE(SUM(${studySessions.duration}), 0)`,
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))

    const stats = sessionsResult[0]

    return {
      totalSessions: Number(stats?.totalSessions ?? 0),
      totalCardsReviewed: Number(stats?.totalCardsReviewed ?? 0),
      totalCardsCorrect: Number(stats?.totalCardsCorrect ?? 0),
      totalDuration: Number(stats?.totalDuration ?? 0),
      accuracy: stats?.totalCardsReviewed
        ? Math.round((Number(stats.totalCardsCorrect) / Number(stats.totalCardsReviewed)) * 100)
        : 0,
    }
  })

// Get grades for filter dropdown
export const getGradesSimple = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    const gradeList = await db
      .select({
        id: grades.id,
        name: grades.name,
        category: grades.category,
      })
      .from(grades)
      .where(eq(grades.isActive, true))
      .orderBy(grades.displayOrder)

    return gradeList
  })

// Get series for filter dropdown
export const getSeriesSimple = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    const seriesList = await db
      .select({
        id: series.id,
        name: series.name,
      })
      .from(series)
      .orderBy(series.displayOrder)

    return seriesList
  })

// Get user detail (alias for getUser with profile info)
export const getUserDetail = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    initAdminDb()
    const db = getDb()

    const result = await db
      .select({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        image: authUser.image,
        createdAt: authUser.createdAt,
        updatedAt: authUser.updatedAt,
        profile: {
          userType: userProfiles.userType,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          phone: userProfiles.phone,
          age: userProfiles.age,
          gender: userProfiles.gender,
          city: userProfiles.city,
          gradeId: userProfiles.gradeId,
          seriesId: userProfiles.seriesId,
          xp: userProfiles.xp,
          isCompleted: userProfiles.isCompleted,
          gradeName: grades.name,
          seriesName: series.name,
        },
      })
      .from(authUser)
      .leftJoin(userProfiles, eq(authUser.id, userProfiles.userId))
      .leftJoin(grades, eq(userProfiles.gradeId, grades.id))
      .leftJoin(series, eq(userProfiles.seriesId, series.id))
      .where(eq(authUser.id, id))
      .limit(1)

    const user = result[0]
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    return user
  })

// Get user study sessions
export const getUserSessions = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: { userId: string, limit?: number }) => data)
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()
    const { userId, limit = 10 } = data

    // Import lessons for join
    const { lessons } = await import('@kurama/data-ops/drizzle/schema')

    const sessions = await db
      .select({
        id: studySessions.id,
        lessonId: studySessions.lessonId,
        lessonTitle: lessons.title,
        mode: studySessions.mode,
        cardsReviewed: studySessions.cardsReviewed,
        cardsCorrect: studySessions.cardsCorrect,
        duration: studySessions.duration,
        startedAt: studySessions.startedAt,
        endedAt: studySessions.endedAt,
      })
      .from(studySessions)
      .leftJoin(lessons, eq(studySessions.lessonId, lessons.id))
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.startedAt))
      .limit(limit)

    return sessions
  })
