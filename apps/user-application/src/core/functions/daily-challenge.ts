import { and, asc, desc, eq, gt, inArray, notInArray, sql } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { cards, lessons, studySessions, subjects, userProfiles, userProgress } from '@kurama/data-ops/drizzle/schema'
import { calculateCurrentStreak } from '@kurama/data-ops/queries/streak'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

/**
 * Daily Challenge XP constants
 */
const DAILY_CHALLENGE_BASE_XP = 100
const DAILY_CHALLENGE_SCORE_BONUS_MULTIPLIER = 0.5 // 50% of score as bonus
const DAILY_CHALLENGE_STREAK_BONUS = 25

/**
 * Adaptive challenge constants
 */
const WEAK_CARDS_PERCENTAGE = 0.7 // 70% weak cards
const ERROR_RATE_THRESHOLD = 0.7 // Cards with < 70% correct are considered weak
const MIN_REVIEWS_FOR_WEAK = 1 // Minimum reviews to be considered for weak selection

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
  subjectName: string // Added for distractor generation
  subjectId: number // Added for same-subject fallback
}

export interface AdaptiveChallengeStats {
  weakCardsCount: number
  newCardsCount: number
  totalCards: number
  isNewUser: boolean
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
  adaptiveStats?: AdaptiveChallengeStats // Stats about card selection
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

    // Calculate consecutive days using shared utility
    const consecutiveDays = await calculateCurrentStreak(db, userId, 'daily_challenge')

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
      const { cards: challengeCards, stats: adaptiveStats } = await generateChallengeCards(db, userId, todayDate)

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
        adaptiveStats,
      }
    }

    // Generate new challenge
    const { cards: challengeCards, stats: adaptiveStats } = await generateChallengeCards(db, userId, todayDate)

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
      adaptiveStats,
    }
  })

/**
 * Generate adaptive challenge cards for a user on a specific date
 * 70% weak cards (based on error rate) + 30% new/mastered cards
 */
async function generateChallengeCards(
  db: ReturnType<typeof getDb>,
  userId: string,
  dateString: string,
): Promise<{ cards: DailyChallengeCard[], stats: AdaptiveChallengeStats }> {
  // Generate deterministic seed for consistent daily challenge
  const seed = generateSeed(userId, dateString)
  const random = seededRandom(seed)

  // Target count: 10-15 cards
  const targetCount = 10 + Math.floor(random() * 6)
  const weakCardsTarget = Math.ceil(targetCount * WEAK_CARDS_PERCENTAGE)

  // 1. Get user's weak cards (error rate > 30%, i.e., correctRate < 70%)
  const weakCardsQuery = await db
    .select({
      cardId: userProgress.cardId,
      lessonId: userProgress.lessonId,
      totalReviews: userProgress.totalReviews,
      correctReviews: userProgress.correctReviews,
      errorRate: sql<number>`1.0 - (${userProgress.correctReviews}::float / NULLIF(${userProgress.totalReviews}, 0))`,
    })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        gt(userProgress.totalReviews, MIN_REVIEWS_FOR_WEAK - 1),
        sql`(${userProgress.correctReviews}::float / NULLIF(${userProgress.totalReviews}, 0)) < ${ERROR_RATE_THRESHOLD}`,
      ),
    )
    .orderBy(
      // Worst performing first
      asc(sql`${userProgress.correctReviews}::float / NULLIF(${userProgress.totalReviews}, 0)`),
      // More practiced = more important to fix
      desc(userProgress.totalReviews),
    )
    .limit(weakCardsTarget * 2) // Get extra for shuffling

  const weakCardIds = weakCardsQuery.map(w => w.cardId)

  // 2. Get full card data with subject info for weak cards
  let weakCards: DailyChallengeCard[] = []
  if (weakCardIds.length > 0) {
    const weakCardsData = await db
      .select({
        id: cards.id,
        frontContent: cards.frontContent,
        backContent: cards.backContent,
        cardType: cards.cardType,
        difficulty: cards.difficulty,
        lessonId: cards.lessonId,
        subjectId: lessons.subjectId,
        subjectName: subjects.name,
      })
      .from(cards)
      .innerJoin(lessons, eq(cards.lessonId, lessons.id))
      .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
      .where(inArray(cards.id, weakCardIds))

    // Shuffle and limit weak cards
    weakCards = shuffleWithSeed(weakCardsData, random)
      .slice(0, weakCardsTarget)
      .map(c => ({
        id: c.id,
        frontContent: c.frontContent,
        backContent: c.backContent,
        cardType: c.cardType,
        difficulty: c.difficulty ?? 0,
        lessonId: c.lessonId,
        subjectId: c.subjectId,
        subjectName: c.subjectName,
      }))
  }

  // 3. Get new/mastered cards (not in weak cards)
  const excludeIds = weakCards.map(c => c.id)
  const otherCardsQuery = await db
    .select({
      id: cards.id,
      frontContent: cards.frontContent,
      backContent: cards.backContent,
      cardType: cards.cardType,
      difficulty: cards.difficulty,
      lessonId: cards.lessonId,
      subjectId: lessons.subjectId,
      subjectName: subjects.name,
    })
    .from(cards)
    .innerJoin(lessons, eq(cards.lessonId, lessons.id))
    .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
    .where(
      excludeIds.length > 0
        ? notInArray(cards.id, excludeIds)
        : sql`1=1`,
    )

  // Shuffle other cards and select based on difficulty distribution
  const shuffledOther = shuffleWithSeed(otherCardsQuery, random)

  // For new users or when we need more cards, use difficulty distribution
  const remainingCount = targetCount - weakCards.length
  let otherCards: DailyChallengeCard[] = []

  if (remainingCount > 0) {
    // Apply difficulty distribution: 30% easy, 50% medium, 20% hard
    const easyCards = shuffledOther.filter(c => (c.difficulty ?? 0) === 0)
    const mediumCards = shuffledOther.filter(c => (c.difficulty ?? 0) === 1)
    const hardCards = shuffledOther.filter(c => (c.difficulty ?? 0) >= 2)

    const easyCount = Math.ceil(remainingCount * 0.3)
    const mediumCount = Math.ceil(remainingCount * 0.5)
    const hardCount = Math.ceil(remainingCount * 0.2)

    const selectedOther = [
      ...easyCards.slice(0, easyCount),
      ...mediumCards.slice(0, mediumCount),
      ...hardCards.slice(0, hardCount),
    ]

    // Fill remaining if not enough in categories
    if (selectedOther.length < remainingCount) {
      const remaining = shuffledOther.filter(c => !selectedOther.some(s => s.id === c.id))
      selectedOther.push(...remaining.slice(0, remainingCount - selectedOther.length))
    }

    otherCards = selectedOther.slice(0, remainingCount).map(c => ({
      id: c.id,
      frontContent: c.frontContent,
      backContent: c.backContent,
      cardType: c.cardType,
      difficulty: c.difficulty ?? 0,
      lessonId: c.lessonId,
      subjectId: c.subjectId,
      subjectName: c.subjectName,
    }))
  }

  // 4. Combine and shuffle final selection
  const allCards = shuffleWithSeed([...weakCards, ...otherCards], random)

  // Determine if this is a new user (no weak cards found)
  const isNewUser = weakCardsQuery.length === 0

  return {
    cards: allCards,
    stats: {
      weakCardsCount: weakCards.length,
      newCardsCount: otherCards.length,
      totalCards: allCards.length,
      isNewUser,
    },
  }
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
    const { cards: challengeCards } = await generateChallengeCards(db, userId, todayDate)
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

    // Calculate consecutive days using shared utility
    const consecutiveDays = await calculateCurrentStreak(db, userId, 'daily_challenge')

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
