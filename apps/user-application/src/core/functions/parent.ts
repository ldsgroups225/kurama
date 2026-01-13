import { and, desc, eq, gte, inArray, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import {
  lessons,
  parentAlertReads,
  studySessions,
  subjects,
  userProfiles,
  userProgress,
} from '@kurama/data-ops/drizzle/schema'
import { getStreakData } from '@kurama/data-ops/queries/streak'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

/**
 * Get the list of children linked to a parent
 */
export const getLinkedChildren = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const { userId } = context

    // 1. Get parent profile to find child matricules
    const parentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    })

    if (!parentProfile || parentProfile.userType !== 'parent' || !parentProfile.childrenMatricules || parentProfile.childrenMatricules.length === 0) {
      return []
    }

    // 2. Fetch children profiles matching the matricules
    const childrenProfiles = await db.query.userProfiles.findMany({
      where: inArray(userProfiles.idNumber, parentProfile.childrenMatricules),
      with: {
        grade: true,
      },
    })

    // 3. Transform to UI format
    return childrenProfiles.map(child => ({
      id: child.userId,
      firstName: child.firstName,
      lastName: child.lastName,
      image: undefined, // Add image if supported later
      gradeName: child.grade?.name ?? 'Niveau inconnu',
      status: 'active' as const, // We will derive this in the detail call or here
    }))
  })

/**
 * Get detailed stats for a specific child
 */
export const getChildStats = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator((childId: string) => childId)
  .handler(async ({ context, data: childId }) => {
    const db = getDb()
    const { userId: parentId } = context

    // 1. Verify parent has access to this child
    const parentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, parentId),
    })

    const childProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, childId),
    })

    if (!parentProfile || !childProfile || !parentProfile.childrenMatricules?.includes(childProfile.idNumber ?? '')) {
      throw new Error('Non autorisé')
    }

    // 2. Fetch study stats (adapted from getDashboardStats)
    const [cardsStudiedResult, streakData] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(userProgress).where(eq(userProgress.userId, childId)),
      getStreakData(db, childId),
    ])

    // Get last activity
    const lastSession = await db.query.studySessions.findFirst({
      where: eq(studySessions.userId, childId),
      orderBy: desc(studySessions.startedAt),
    })

    const lastActiveAt = lastSession ? new Date(lastSession.startedAt) : null

    // Derive activity status
    let activityStatus: 'active' | 'warning' | 'inactive' = 'inactive'
    if (lastActiveAt) {
      const diffMs = Date.now() - lastActiveAt.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      if (diffDays < 1)
        activityStatus = 'active'
      else if (diffDays < 3)
        activityStatus = 'warning'
    }

    // Mock weekly goal (can be improved by adding goal settings to profile)
    const weeklyGoalMinutes = 600 // default 10h

    // Calculate weekly study minutes (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklySessions = await db.select({
      duration: studySessions.duration,
    })
      .from(studySessions)
      .where(and(
        eq(studySessions.userId, childId),
        gte(studySessions.startedAt, sevenDaysAgo.toISOString()),
      ))

    const weeklyStudyMinutes = Math.floor(weeklySessions.reduce((acc, s) => acc + (s.duration ?? 0), 0) / 60)

    // Calculate subject performance
    const performances = await db.select({
      subjectName: subjects.name,
      subjectId: subjects.id,
      cardsReviewed: sql<number>`sum(${studySessions.cardsReviewed})`,
      cardsCorrect: sql<number>`sum(${studySessions.cardsCorrect})`,
    })
      .from(studySessions)
      .innerJoin(lessons, eq(studySessions.lessonId, lessons.id))
      .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(eq(studySessions.userId, childId))
      .groupBy(subjects.id, subjects.name)

    const subjectPerformance = performances.map((p) => {
      const total = Number(p.cardsReviewed || 0)
      const correct = Number(p.cardsCorrect || 0)
      const successRate = total > 0 ? Math.round((correct / total) * 100) : 0

      return {
        subjectId: String(p.subjectId),
        subjectName: p.subjectName,
        subjectColor: 'xp' as const, // Should be derived from subject settings if available
        successRate,
        trend: 'stable' as const, // Harder to calculate without historical window
        studyMinutes: 0, // Could also sum duration here if needed
      }
    })

    // 4. Fetch recent sessions
    const recentSessionsData = await db
      .select({
        id: studySessions.id,
        cardsReviewed: studySessions.cardsReviewed,
        cardsCorrect: studySessions.cardsCorrect,
        startedAt: studySessions.startedAt,
        duration: studySessions.duration,
        lessonTitle: lessons.title,
        subjectName: subjects.name,
      })
      .from(studySessions)
      .innerJoin(lessons, eq(studySessions.lessonId, lessons.id))
      .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(eq(studySessions.userId, childId))
      .orderBy(desc(studySessions.startedAt))
      .limit(5)

    return {
      lastActiveAt,
      activityStatus,
      weeklyStudyMinutes,
      weeklyGoalMinutes,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalSessions: weeklySessions.length, // Change this to total sessions if needed
      totalCards: Number(cardsStudiedResult[0]?.count ?? 0),
      successRate: subjectPerformance.length > 0
        ? Math.round(subjectPerformance.reduce((acc, p) => acc + p.successRate, 0) / subjectPerformance.length)
        : 0,
      subjectPerformance,
      recentSessions: recentSessionsData.map(s => ({
        id: s.id,
        lessonTitle: s.lessonTitle,
        subjectName: s.subjectName,
        cardsReviewed: s.cardsReviewed,
        cardsCorrect: s.cardsCorrect,
        startedAt: s.startedAt,
        duration: s.duration,
      })),
    }
  })

/**
 * Get alerts for all children linked to a parent
 */
export const getParentAlerts = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const { userId: parentId } = context

    // 1. Get children
    const parentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, parentId),
    })

    if (!parentProfile || !parentProfile.childrenMatricules || parentProfile.childrenMatricules.length === 0) {
      return []
    }

    const children = await db.query.userProfiles.findMany({
      where: inArray(userProfiles.idNumber, parentProfile.childrenMatricules),
    })

    const alerts: any[] = []

    // 2. Fetch read alerts for this parent
    const readAlerts = await db.query.parentAlertReads.findMany({
      where: eq(parentAlertReads.parentId, parentId),
    })
    const readAlertIds = new Set(readAlerts.map((r: { alertId: string }) => r.alertId))

    for (const child of children) {
      // Fetch child's last activity
      const lastSession = await db.query.studySessions.findFirst({
        where: eq(studySessions.userId, child.userId),
        orderBy: desc(studySessions.startedAt),
      })

      const lastActiveAt = lastSession ? new Date(lastSession.startedAt) : null

      // Inactivity Alert
      const inactivityId = `inactivity-${child.userId}`
      if (!readAlertIds.has(inactivityId)) {
        if (!lastActiveAt || (Date.now() - lastActiveAt.getTime()) > (3 * 24 * 60 * 60 * 1000)) {
          alerts.push({
            id: inactivityId,
            type: 'warning',
            title: 'Inactivité prolongée',
            description: `${child.firstName} n'a pas étudié depuis ${lastActiveAt ? '3 jours' : 'longtemps'}.`,
            createdAt: new Date(),
            read: false,
            childId: child.userId,
          })
        }
      }

      // Success Alert (Streak milestone example)
      const streakData = await getStreakData(db, child.userId)
      const streakId = `streak-7-${child.userId}` // Simplified ID for persistence
      if (!readAlertIds.has(streakId)) {
        if (streakData.currentStreak >= 7) {
          alerts.push({
            id: streakId,
            type: 'success',
            title: 'Série incroyable !',
            description: `${child.firstName} a une série de ${streakData.currentStreak} jours !`,
            createdAt: new Date(),
            read: false,
            childId: child.userId,
          })
        }
      }
    }

    return alerts
  })

/**
 * Mark a specific alert as read
 */
export const markAlertAsRead = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator((alertId: string) => alertId)
  .handler(async ({ context, data: alertId }) => {
    const db = getDb()
    const { userId: parentId } = context

    await db.insert(parentAlertReads).values({
      parentId,
      alertId,
    }).onConflictDoNothing()

    return { success: true }
  })

/**
 * Mark all alerts for a child or all children as read
 */
export const markAllAlertsAsRead = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator((alertIds: string[]) => alertIds)
  .handler(async ({ context, data: alertIds }) => {
    const db = getDb()
    const { userId: parentId } = context

    if (alertIds.length === 0)
      return { success: true }

    await db.insert(parentAlertReads).values(
      alertIds.map(id => ({
        parentId,
        alertId: id,
      })),
    ).onConflictDoNothing()

    return { success: true }
  })
