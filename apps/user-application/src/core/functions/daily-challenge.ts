import { and, eq, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { studySessions, userProfiles } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

/**
 * Daily Challenge XP constants
 */
const DAILY_CHALLENGE_BASE_XP = 100
const DAILY_CHALLENGE_SCORE_BONUS_MULTIPLIER = 0.5 // 50% of score as bonus
const DAILY_CHALLENGE_STREAK_BONUS = 25

/**
 * Get today's date in Africa/Abidjan timezone (UTC+0)
 */
function getTodayDateString(): string {
  const now = new Date()
  // Africa/Abidjan is UTC+0, so we can use UTC date
  return now.toISOString().split('T')[0] ?? ''
}

/**
 * Generate deterministic seed from userId and date
 */
function generateSeed(userId: string, dateString: string): number {
  const str = `${userId}-${dateString}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Seeded random number generator
 */
function seededRandom(seed: number): () => number {
  let currentSeed = seed
  return () => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7FFFFFFF
    return currentSeed / 0x7FFFFFFF
  }
}

/**
 * Shuffle array with seeded random
 */
function shuffleWithSeed<T>(array: T[], random: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]!
    result[j] = temp!
  }
  return result
}

export interface DailyChallengeCard {
  id: number
  frontContent: string
  backContent: string
  cardType: string
  difficulty: number
  lessonId: number
}

export interface DailyChallengeStatus {
  isAvailable: boolean
  isCompleted: boolean
  isInProgress: boolean
  challengeDate: string
  cards: DailyChallengeCard[]
  totalCards: number
  estimatedMinutes: number
  completedAt?: string
  score?: number
  xpEarned?: number
  progressCount?: number
  timeUntilReset: number // seconds until midnight
  consecutiveDays: number
}

export interface DailyChallengeResult {
  score: number
  xpEarned: number
  xpBreakdown: {
    base: number
    scoreBonus: number
    streakBonus: number
  }
  consecutiveDays: number
  achievementsUnlocked: string[]
}

/**
 * Get today's daily challenge status
 */
export const getDailyChallengeStatus = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }): Promise<DailyChallengeStatus> => {
    const db = getDb()
    const userId = context.userId
    const todayDate = getTodayDateString()

    // Calculate time until midnight (Africa/Abidjan = UTC)
    const now = new Date()
    const midnight = new Date(now)
    midnight.setUTCHours(24, 0, 0, 0)
    const timeUntilReset = Math.floor((midnight.getTime() - now.getTime()) / 1000)

    // Check if user has completed today's challenge
    const existingSession = await db.query.studySessions.findFirst({
      where: and(
        eq(studySessions.userId, userId),
        eq(studySessions.mode, 'daily_challenge'),
        sql`DATE(${studySessions.startedAt}) = ${todayDate}`,
      ),
    })

    // Calculate consecutive days
    const recentSessions = await db
      .select({ startedAt: studySessions.startedAt })
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          eq(studySessions.mode, 'daily_challenge'),
        ),
      )
      .orderBy(sql`${studySessions.startedAt} DESC`)
      .limit(31)

    const uniqueDates = Array.from(new Set(
      recentSessions.map(s => s.startedAt.split('T')[0]),
    )).sort().reverse()

    let consecutiveDays = 0
    const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]

    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(now.getTime() - (i * 86400000)).toISOString().split('T')[0]
      // Allow today or yesterday as starting point
      if (i === 0 && uniqueDates[i] !== todayDate && uniqueDates[i] !== yesterday) {
        break
      }
      if (uniqueDates[i] === expectedDate || (i === 0 && uniqueDates[i] === yesterday)) {
        consecutiveDays++
      }
      else {
        break
      }
    }

    // If completed today, return completed status
    if (existingSession && existingSession.endedAt) {
      const score = existingSession.cardsCorrect && existingSession.cardsReviewed
        ? Math.round((existingSession.cardsCorrect / existingSession.cardsReviewed) * 100)
        : 0

      // Calculate XP earned (simplified - actual XP is stored in profile)
      const xpEarned = DAILY_CHALLENGE_BASE_XP + Math.round(score * DAILY_CHALLENGE_SCORE_BONUS_MULTIPLIER)

      return {
        isAvailable: false,
        isCompleted: true,
        isInProgress: false,
        challengeDate: todayDate,
        cards: [],
        totalCards: existingSession.cardsReviewed,
        estimatedMinutes: 0,
        completedAt: existingSession.endedAt,
        score,
        xpEarned,
        timeUntilReset,
        consecutiveDays,
      }
    }

    // Check if in progress (started but not completed)
    if (existingSession && !existingSession.endedAt) {
      // Get the cards for this challenge
      const challengeCards = await generateChallengeCards(db, userId, todayDate)

      return {
        isAvailable: true,
        isCompleted: false,
        isInProgress: true,
        challengeDate: todayDate,
        cards: challengeCards,
        totalCards: challengeCards.length,
        estimatedMinutes: Math.ceil(challengeCards.length * 0.67), // ~40 seconds per card
        progressCount: existingSession.cardsReviewed,
        timeUntilReset,
        consecutiveDays,
      }
    }

    // Generate new challenge
    const challengeCards = await generateChallengeCards(db, userId, todayDate)

    return {
      isAvailable: true,
      isCompleted: false,
      isInProgress: false,
      challengeDate: todayDate,
      cards: challengeCards,
      totalCards: challengeCards.length,
      estimatedMinutes: Math.ceil(challengeCards.length * 0.67),
      timeUntilReset,
      consecutiveDays,
    }
  })

/**
 * Generate challenge cards for a user on a specific date
 */
async function generateChallengeCards(
  db: ReturnType<typeof getDb>,
  userId: string,
  dateString: string,
): Promise<DailyChallengeCard[]> {
  // Get all available cards
  const allCards = await db.query.cards.findMany({
    columns: {
      id: true,
      frontContent: true,
      backContent: true,
      cardType: true,
      difficulty: true,
      lessonId: true,
    },
  })

  if (allCards.length === 0) {
    return []
  }

  // Generate deterministic seed
  const seed = generateSeed(userId, dateString)
  const random = seededRandom(seed)

  // Shuffle cards deterministically
  const shuffled = shuffleWithSeed(allCards, random)

  // Select 10-15 cards based on difficulty distribution
  // 30% easy (difficulty 0), 50% medium (difficulty 1), 20% hard (difficulty 2+)
  const targetCount = 10 + Math.floor(random() * 6) // 10-15 cards

  const easyCards = shuffled.filter(c => (c.difficulty ?? 0) === 0)
  const mediumCards = shuffled.filter(c => (c.difficulty ?? 0) === 1)
  const hardCards = shuffled.filter(c => (c.difficulty ?? 0) >= 2)

  const selectedCards: typeof allCards = []

  // Add easy cards (30%)
  const easyCount = Math.ceil(targetCount * 0.3)
  selectedCards.push(...easyCards.slice(0, easyCount))

  // Add medium cards (50%)
  const mediumCount = Math.ceil(targetCount * 0.5)
  selectedCards.push(...mediumCards.slice(0, mediumCount))

  // Add hard cards (20%)
  const hardCount = Math.ceil(targetCount * 0.2)
  selectedCards.push(...hardCards.slice(0, hardCount))

  // If not enough cards in categories, fill from shuffled
  if (selectedCards.length < targetCount) {
    const remaining = shuffled.filter(c => !selectedCards.includes(c))
    selectedCards.push(...remaining.slice(0, targetCount - selectedCards.length))
  }

  // Shuffle final selection and limit to target count
  const finalCards = shuffleWithSeed(selectedCards.slice(0, targetCount), random)

  return finalCards.map(c => ({
    id: c.id,
    frontContent: c.frontContent,
    backContent: c.backContent,
    cardType: c.cardType,
    difficulty: c.difficulty ?? 0,
    lessonId: c.lessonId,
  }))
}

/**
 * Start a daily challenge session
 */
export const startDailyChallenge = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const userId = context.userId
    const todayDate = getTodayDateString()

    // Check if already completed today
    const existingSession = await db.query.studySessions.findFirst({
      where: and(
        eq(studySessions.userId, userId),
        eq(studySessions.mode, 'daily_challenge'),
        sql`DATE(${studySessions.startedAt}) = ${todayDate}`,
      ),
    })

    if (existingSession?.endedAt) {
      throw new Error('Daily challenge already completed today')
    }

    // If session exists but not completed, return it
    if (existingSession) {
      return { sessionId: existingSession.id, resumed: true }
    }

    // Get challenge cards to find a valid lessonId
    const challengeCards = await generateChallengeCards(db, userId, todayDate)
    if (challengeCards.length === 0) {
      throw new Error('No cards available for daily challenge')
    }

    // Use the first card's lessonId as the session's lessonId
    const firstLessonId = challengeCards[0]!.lessonId

    // Create new session with a valid lessonId from the challenge cards
    const result = await db.insert(studySessions).values({
      userId,
      lessonId: firstLessonId,
      mode: 'daily_challenge',
      startedAt: new Date().toISOString(),
      cardsReviewed: 0,
      cardsCorrect: 0,
    }).returning({ id: studySessions.id })

    return { sessionId: result[0]?.id, resumed: false }
  })

/**
 * Complete a daily challenge
 */
export const completeDailyChallenge = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: { sessionId: number, correctCount: number, totalCount: number, duration: number }) => {
    if (typeof data.sessionId !== 'number') {
      throw new TypeError('Invalid sessionId')
    }
    if (typeof data.correctCount !== 'number' || typeof data.totalCount !== 'number') {
      throw new TypeError('Invalid counts')
    }
    return data
  })
  .handler(async ({ data, context }): Promise<DailyChallengeResult> => {
    const db = getDb()
    const userId = context.userId
    const { sessionId, correctCount, totalCount, duration } = data

    // Verify session belongs to user and is not completed
    const session = await db.query.studySessions.findFirst({
      where: and(
        eq(studySessions.id, sessionId),
        eq(studySessions.userId, userId),
        eq(studySessions.mode, 'daily_challenge'),
      ),
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.endedAt) {
      throw new Error('Session already completed')
    }

    // Calculate score
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

    // Update session
    await db
      .update(studySessions)
      .set({
        endedAt: new Date().toISOString(),
        cardsReviewed: totalCount,
        cardsCorrect: correctCount,
        duration,
      })
      .where(eq(studySessions.id, sessionId))

    // Calculate consecutive days
    const recentSessions = await db
      .select({ startedAt: studySessions.startedAt })
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          eq(studySessions.mode, 'daily_challenge'),
          sql`${studySessions.endedAt} IS NOT NULL`,
        ),
      )
      .orderBy(sql`${studySessions.startedAt} DESC`)
      .limit(31)

    const uniqueDates = Array.from(new Set(
      recentSessions.map(s => s.startedAt.split('T')[0]),
    )).sort().reverse()

    let consecutiveDays = 1 // Today counts
    for (let i = 1; i < uniqueDates.length; i++) {
      const expectedDate = new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0]
      if (uniqueDates[i] === expectedDate) {
        consecutiveDays++
      }
      else {
        break
      }
    }

    // Calculate XP
    const baseXP = DAILY_CHALLENGE_BASE_XP
    const scoreBonus = Math.round(score * DAILY_CHALLENGE_SCORE_BONUS_MULTIPLIER)
    const streakBonus = consecutiveDays > 1 ? DAILY_CHALLENGE_STREAK_BONUS : 0
    const totalXP = baseXP + scoreBonus + streakBonus

    // Update user XP
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    })

    const newXP = (profile?.xp ?? 0) + totalXP
    await db
      .update(userProfiles)
      .set({ xp: newXP, updatedAt: new Date().toISOString() })
      .where(eq(userProfiles.userId, userId))

    // Check achievements
    const achievementsUnlocked: string[] = []
    if (consecutiveDays === 7) {
      achievementsUnlocked.push('daily-warrior')
    }
    if (consecutiveDays === 30) {
      achievementsUnlocked.push('unstoppable')
    }
    if (score === 100) {
      achievementsUnlocked.push('perfect-daily')
    }

    return {
      score,
      xpEarned: totalXP,
      xpBreakdown: {
        base: baseXP,
        scoreBonus,
        streakBonus,
      },
      consecutiveDays,
      achievementsUnlocked,
    }
  })
