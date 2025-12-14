import { eq, gte, sql } from '@kurama/data-ops/database/drizzle-orm'
import {
  authUser,
  cards,
  lessons,
  studySessions,
  subjects,
  userProfiles,
} from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { getDb, initAdminDb } from '@/lib/db'
import { adminMiddleware } from '../middleware/admin-auth'

// Get dashboard statistics
export const getDashboardStats = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    // Get user counts
    const userCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(authUser)
    const totalUsers = Number(userCountResult[0]?.count ?? 0)

    // Get student/parent breakdown
    const studentCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userProfiles)
      .where(eq(userProfiles.userType, 'student'))
    const totalStudents = Number(studentCountResult[0]?.count ?? 0)

    const parentCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userProfiles)
      .where(eq(userProfiles.userType, 'parent'))
    const totalParents = Number(parentCountResult[0]?.count ?? 0)

    // Get completed profiles
    const completedProfilesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userProfiles)
      .where(eq(userProfiles.isCompleted, true))
    const completedProfiles = Number(completedProfilesResult[0]?.count ?? 0)

    // Get content counts
    const subjectCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subjects)
    const totalSubjects = Number(subjectCountResult[0]?.count ?? 0)

    const lessonCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(lessons)
    const totalLessons = Number(lessonCountResult[0]?.count ?? 0)

    const publishedLessonCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(lessons)
      .where(eq(lessons.isPublished, true))
    const publishedLessons = Number(publishedLessonCountResult[0]?.count ?? 0)

    const cardCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(cards)
    const totalCards = Number(cardCountResult[0]?.count ?? 0)

    // Get session stats (today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    const todaySessionsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(studySessions)
      .where(gte(studySessions.startedAt, todayStr))
    const todaySessions = Number(todaySessionsResult[0]?.count ?? 0)

    // Get total sessions
    const totalSessionsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(studySessions)
    const totalSessions = Number(totalSessionsResult[0]?.count ?? 0)

    // Get users registered this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString()

    const newUsersResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(authUser)
      .where(gte(authUser.createdAt, weekAgoStr))
    const newUsersThisWeek = Number(newUsersResult[0]?.count ?? 0)

    return {
      users: {
        total: totalUsers,
        students: totalStudents,
        parents: totalParents,
        completedProfiles,
        newThisWeek: newUsersThisWeek,
      },
      content: {
        subjects: totalSubjects,
        lessons: totalLessons,
        publishedLessons,
        cards: totalCards,
      },
      sessions: {
        total: totalSessions,
        today: todaySessions,
      },
    }
  })

// Get content statistics by subject
export const getContentStats = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    // Get subjects with lesson and card counts
    const subjectStats = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        abbreviation: subjects.abbreviation,
        lessonCount: sql<number>`(
          SELECT COUNT(*) FROM "lessons" 
          WHERE "lessons"."subject_id" = "subjects"."id"
        )`,
        cardCount: sql<number>`(
          SELECT COUNT(*) FROM "cards" 
          INNER JOIN "lessons" ON "cards"."lesson_id" = "lessons"."id"
          WHERE "lessons"."subject_id" = "subjects"."id"
        )`,
        publishedLessonCount: sql<number>`(
          SELECT COUNT(*) FROM "lessons" 
          WHERE "lessons"."subject_id" = "subjects"."id" 
          AND "lessons"."is_published" = true
        )`,
      })
      .from(subjects)
      .orderBy(subjects.displayOrder)

    return subjectStats.map(s => ({
      ...s,
      lessonCount: Number(s.lessonCount),
      cardCount: Number(s.cardCount),
      publishedLessonCount: Number(s.publishedLessonCount),
    }))
  })

// Get recent activity
export const getRecentActivity = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    // Get recent study sessions with user info
    const recentSessions = await db
      .select({
        id: studySessions.id,
        userId: studySessions.userId,
        userName: authUser.name,
        userEmail: authUser.email,
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
      .leftJoin(authUser, eq(studySessions.userId, authUser.id))
      .leftJoin(lessons, eq(studySessions.lessonId, lessons.id))
      .orderBy(sql`${studySessions.startedAt} DESC`)
      .limit(10)

    return recentSessions
  })

// Get user registration stats by day (last 30 days)
export const getUserGrowth = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

    const growth = await db
      .select({
        date: sql<string>`DATE(${authUser.createdAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(authUser)
      .where(gte(authUser.createdAt, thirtyDaysAgoStr))
      .groupBy(sql`DATE(${authUser.createdAt})`)
      .orderBy(sql`DATE(${authUser.createdAt})`)

    return growth.map(g => ({
      date: g.date,
      count: Number(g.count),
    }))
  })

// Get session stats by day (last 30 days)
export const getSessionGrowth = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    initAdminDb()
    const db = getDb()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

    const growth = await db
      .select({
        date: sql<string>`DATE(${studySessions.startedAt})`,
        count: sql<number>`COUNT(*)`,
        cardsReviewed: sql<number>`COALESCE(SUM(${studySessions.cardsReviewed}), 0)`,
      })
      .from(studySessions)
      .where(gte(studySessions.startedAt, thirtyDaysAgoStr))
      .groupBy(sql`DATE(${studySessions.startedAt})`)
      .orderBy(sql`DATE(${studySessions.startedAt})`)

    return growth.map(g => ({
      date: g.date,
      count: Number(g.count),
      cardsReviewed: Number(g.cardsReviewed),
    }))
  })
