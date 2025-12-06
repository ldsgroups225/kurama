import { and, desc, eq, gte, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { studySessions, userLessonMastery, userProfiles } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

/**
 * XP calculation constants
 */
const XP_BASE_CORRECT = 10 // Base XP per correct answer
const XP_STREAK_BONUS_MULTIPLIER = 0.1 // 10% bonus per streak day (max 50%)
const XP_STREAK_BONUS_MAX = 0.5
const XP_PERFECT_SCORE_BONUS = 50 // Bonus for 100% score
const XP_SPEED_BONUS_THRESHOLD = 30 // Seconds per card for speed bonus
const XP_SPEED_BONUS = 25 // Bonus for fast completion
const XP_PASSING_BONUS = 100 // Bonus for passing (>=80%)

/**
 * Level thresholds - XP required to reach each level
 */
const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  800, // Level 5
  1200, // Level 6
  1700, // Level 7
  2300, // Level 8
  3000, // Level 9
  3800, // Level 10
  4700, // Level 11
  5700, // Level 12
  6800, // Level 13
  8000, // Level 14
  9300, // Level 15
  10700, // Level 16
  12200, // Level 17
  13800, // Level 18
  15500, // Level 19
  17300, // Level 20
]

/**
 * Calculate level from XP
 */
function calculateLevel(xp: number): { level: number, currentXP: number, nextLevelXP: number } {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= (LEVEL_THRESHOLDS[i] ?? 0)) {
      level = i + 1
      break
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 500

  return {
    level,
    currentXP: xp - currentThreshold,
    nextLevelXP: nextThreshold - currentThreshold,
  }
}

/**
 * Calculate current streak from study sessions
 */
async function calculateStreak(db: ReturnType<typeof getDb>, userId: string): Promise<number> {
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

  if (uniqueDates.length === 0)
    return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday)
    return 0

  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDateStr = uniqueDates[i - 1]
    const currDateStr = uniqueDates[i]
    if (!prevDateStr || !currDateStr)
      continue

    const prevDate = new Date(prevDateStr)
    const currDate = new Date(currDateStr)
    const diffDays = Math.round(Math.abs(prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      streak++
    }
    else {
      break
    }
  }

  return streak
}

export interface SessionStatsInput {
  lessonId: number
  correctCount: number
  totalCount: number
  duration: number // in seconds
  mode: 'flashcards' | 'quiz' | 'exam'
}

export interface SessionStatsResult {
  xpEarned: number
  xpBreakdown: {
    base: number
    streakBonus: number
    perfectBonus: number
    speedBonus: number
    passingBonus: number
  }
  totalXP: number
  previousLevel: number
  currentLevel: number
  leveledUp: boolean
  currentLevelXP: number
  nextLevelXP: number
  currentStreak: number
  achievementsUnlocked: string[]
  isPassing: boolean
  percentage: number
  masteryCount: number
  isLessonCompleted: boolean
  nextLessonUnlocked: boolean
  nextLessonTitle: string | null
}

/**
 * Update session stats after learning activity completion
 * Calculates XP with bonuses, updates level, checks achievements, updates streak
 */
export const updateSessionStats = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: SessionStatsInput) => {
    if (typeof data.lessonId !== 'number' || Number.isNaN(data.lessonId)) {
      throw new TypeError('Invalid input: lessonId must be a number')
    }
    if (typeof data.correctCount !== 'number' || typeof data.totalCount !== 'number') {
      throw new TypeError('Invalid input: correctCount and totalCount must be numbers')
    }
    if (typeof data.duration !== 'number') {
      throw new TypeError('Invalid input: duration must be a number')
    }
    return data
  })
  .handler(async ({ data, context }): Promise<SessionStatsResult> => {
    const db = getDb()
    const userId = context.userId
    const { lessonId, correctCount, totalCount, duration, mode } = data

    // Calculate percentage
    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    const isPassing = percentage >= 80

    // Get current user profile
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    })

    const previousXP = profile?.xp ?? 0
    const previousLevelInfo = calculateLevel(previousXP)

    // Calculate current streak for bonus
    const currentStreak = await calculateStreak(db, userId)

    // Calculate XP breakdown
    const baseXP = correctCount * XP_BASE_CORRECT
    const streakMultiplier = Math.min(currentStreak * XP_STREAK_BONUS_MULTIPLIER, XP_STREAK_BONUS_MAX)
    const streakBonus = Math.round(baseXP * streakMultiplier)
    const perfectBonus = percentage === 100 ? XP_PERFECT_SCORE_BONUS : 0
    const avgTimePerCard = totalCount > 0 ? duration / totalCount : 0
    const speedBonus = avgTimePerCard > 0 && avgTimePerCard <= XP_SPEED_BONUS_THRESHOLD ? XP_SPEED_BONUS : 0
    const passingBonus = isPassing ? XP_PASSING_BONUS : 0

    const totalXPEarned = baseXP + streakBonus + perfectBonus + speedBonus + passingBonus
    const newTotalXP = previousXP + totalXPEarned

    // Update user XP
    await db
      .update(userProfiles)
      .set({ xp: newTotalXP, updatedAt: new Date().toISOString() })
      .where(eq(userProfiles.userId, userId))

    // Calculate new level
    const newLevelInfo = calculateLevel(newTotalXP)
    const leveledUp = newLevelInfo.level > previousLevelInfo.level

    // Record study session
    await db.insert(studySessions).values({
      userId,
      lessonId,
      mode,
      startedAt: new Date(Date.now() - duration * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      cardsReviewed: totalCount,
      cardsCorrect: correctCount,
      duration,
    })

    // Update lesson mastery if passing
    let masteryCount = 0
    let isLessonCompleted = false
    let nextLessonUnlocked = false
    let nextLessonTitle: string | null = null

    if (isPassing) {
      const existingMastery = await db.query.userLessonMastery.findFirst({
        where: and(
          eq(userLessonMastery.userId, userId),
          eq(userLessonMastery.lessonId, lessonId),
        ),
      })

      if (existingMastery) {
        masteryCount = existingMastery.successfulTestCount + 1
        const wasCompleted = existingMastery.successfulTestCount >= 2

        await db
          .update(userLessonMastery)
          .set({
            successfulTestCount: masteryCount,
            lastTestScore: percentage,
            lastTestAt: new Date().toISOString(),
            isUnlocked: masteryCount >= 2,
            updatedAt: new Date().toISOString(),
          })
          .where(
            and(
              eq(userLessonMastery.userId, userId),
              eq(userLessonMastery.lessonId, lessonId),
            ),
          )

        isLessonCompleted = masteryCount >= 2
        nextLessonUnlocked = isLessonCompleted && !wasCompleted
      }
      else {
        masteryCount = 1
        await db.insert(userLessonMastery).values({
          userId,
          lessonId,
          successfulTestCount: 1,
          lastTestScore: percentage,
          lastTestAt: new Date().toISOString(),
          isUnlocked: false,
        })
      }

      // Check for next lesson unlock
      if (nextLessonUnlocked) {
        const { lessons } = await import('@kurama/data-ops/drizzle/schema')
        const currentLesson = await db.query.lessons.findFirst({
          where: eq(lessons.id, lessonId),
        })

        if (currentLesson) {
          const nextLesson = await db.query.lessons.findFirst({
            where: and(
              eq(lessons.subjectId, currentLesson.subjectId),
              eq(lessons.displayOrder, currentLesson.displayOrder + 1),
            ),
          })
          nextLessonTitle = nextLesson?.title ?? null
        }
      }
    }

    // Check achievements (simplified - can be expanded)
    const achievementsUnlocked: string[] = []

    // Level-based achievements
    if (leveledUp) {
      if (newLevelInfo.level === 5)
        achievementsUnlocked.push('level-5')
      if (newLevelInfo.level === 10)
        achievementsUnlocked.push('level-10')
      if (newLevelInfo.level === 20)
        achievementsUnlocked.push('level-20')
    }

    // Streak achievements
    if (currentStreak === 7)
      achievementsUnlocked.push('streak-7')
    if (currentStreak === 30)
      achievementsUnlocked.push('streak-30')

    // Perfect score achievement
    if (percentage === 100)
      achievementsUnlocked.push('perfect-score')

    return {
      xpEarned: totalXPEarned,
      xpBreakdown: {
        base: baseXP,
        streakBonus,
        perfectBonus,
        speedBonus,
        passingBonus,
      },
      totalXP: newTotalXP,
      previousLevel: previousLevelInfo.level,
      currentLevel: newLevelInfo.level,
      leveledUp,
      currentLevelXP: newLevelInfo.currentXP,
      nextLevelXP: newLevelInfo.nextLevelXP,
      currentStreak,
      achievementsUnlocked,
      isPassing,
      percentage,
      masteryCount,
      isLessonCompleted,
      nextLessonUnlocked,
      nextLessonTitle,
    }
  })

/**
 * Get current user stats for display
 */
export const getUserStats = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const userId = context.userId

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    })

    const totalXP = profile?.xp ?? 0
    const levelInfo = calculateLevel(totalXP)
    const currentStreak = await calculateStreak(db, userId)

    // Get lessons completed count
    const masteryResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userLessonMastery)
      .where(
        and(
          eq(userLessonMastery.userId, userId),
          gte(userLessonMastery.successfulTestCount, 2),
        ),
      )

    const lessonsCompleted = Number(masteryResult[0]?.count ?? 0)

    return {
      totalXP,
      level: levelInfo.level,
      currentLevelXP: levelInfo.currentXP,
      nextLevelXP: levelInfo.nextLevelXP,
      currentStreak,
      lessonsCompleted,
    }
  })
