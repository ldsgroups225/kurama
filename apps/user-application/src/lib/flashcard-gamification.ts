/**
 * Enhanced Flashcard Gamification System
 * Based on spaced repetition science and engagement psychology
 */

export interface FlashcardSession {
  streakDays: number
  currentCombo: number
  totalCardsToday: number
  sessionStartTime: Date
  perfectCards: number
}

export interface FlashcardCard {
  id: number
  difficulty: 'easy' | 'medium' | 'hard'
  intervalStage: 'first_review' | 'day_1' | 'day_3' | 'week_1' | 'week_2' | 'month_1' | 'long_term'
  responseQuality: 'perfect' | 'good' | 'struggled'
  lastReviewedAt?: string
  easeFactor: number
  repetitions: number
}

export interface XPCalculationResult {
  baseXP: number
  multipliers: {
    streak: number
    difficulty: number
    interval: number
    accuracy: number
  }
  bonuses: {
    name: string
    value: number
  }[]
  totalXP: number
  achievements: string[]
}

/**
 * Enhanced XP rates - flashcards now get proper recognition
 */
export const ENHANCED_XP_BASE_RATES = {
  flashcards: 8,        // ↑ Increased from 5 to 8 (recognition of learning value)
  quiz: 10,             // Standard objective assessment
  exam: 12,             // Timed + objective, highest base rate
  'quick-review': 7,    // Targeted difficult card review
} as const

/**
 * Flashcard-specific multipliers for enhanced gamification
 */
export const FLASHCARD_MULTIPLIERS = {
  // Daily streak multipliers
  streak: {
    3: 1.1,    // 3 days consecutive: +10%
    7: 1.25,   // 1 week: +25%
    14: 1.4,   // 2 weeks: +40%
    30: 1.5,   // 1 month: +50% (max)
  },

  // Card difficulty multipliers
  difficulty: {
    hard: 1.3,     // Hard cards worth more (struggling = learning)
    medium: 1.0,   // Standard rate
    easy: 0.8,     // Easy cards worth less (already mastered)
  },

  // Spaced repetition interval multipliers
  interval: {
    first_review: 1.0,   // First time seeing card
    day_1: 1.1,          // 1 day later: +10%
    day_3: 1.2,          // 3 days later: +20%
    week_1: 1.3,         // 1 week later: +30%
    week_2: 1.4,         // 2 weeks later: +40%
    month_1: 1.5,        // 1 month later: +50%
    long_term: 1.6,      // Long-term retention: +60% (max reward)
  },

  // Response quality multipliers
  accuracy: {
    perfect: 1.2,    // Immediate correct response: +20%
    good: 1.0,       // Correct but took time: standard
    struggled: 0.9,  // Hesitated but got it: -10%
  },
} as const

/**
 * Bonus XP for achievements and milestones
 */
export const FLASHCARD_BONUSES = {
  // Time-based bonuses
  morning_learner: 5,      // Study before 9 AM
  night_owl: 3,            // Study after 10 PM
  weekend_warrior: 8,      // Study on weekends

  // Performance bonuses
  perfect_session: 20,     // All cards correct in session
  century_club: 50,        // 100 cards in one session
  speed_demon: 15,         // Average < 3 seconds per card

  // Combo bonuses (consecutive correct answers)
  combo_5: 10,
  combo_10: 25,
  combo_15: 40,
  combo_20: 60,
  combo_25: 85,
  combo_30: 115,           // Exponential growth for excitement

  // Mastery bonuses
  card_mastery: 30,        // Card graduated from "hard" to "easy"
  lesson_mastery: 100,     // All cards in lesson mastered
  subject_mastery: 500,    // All lessons in subject mastered

  // Milestone bonuses
  first_100_cards: 100,
  first_500_cards: 300,
  first_1000_cards: 750,
  first_5000_cards: 2000,
} as const

/**
 * Calculate enhanced XP for a flashcard interaction
 */
export function calculateFlashcardXP(
  card: FlashcardCard,
  session: FlashcardSession,
  isCorrect: boolean
): XPCalculationResult {
  const baseXP = ENHANCED_XP_BASE_RATES.flashcards
  const multipliers = {
    streak: 1,
    difficulty: 1,
    interval: 1,
    accuracy: 1,
  }
  const bonuses: { name: string; value: number }[] = []
  const achievements: string[] = []

  // Only award XP for correct answers
  if (!isCorrect) {
    return {
      baseXP: 0,
      multipliers,
      bonuses,
      totalXP: 0,
      achievements,
    }
  }

  // Apply streak multiplier
  const streakMultiplier = getStreakMultiplier(session.streakDays)
  multipliers.streak = streakMultiplier

  // Apply difficulty multiplier
  multipliers.difficulty = FLASHCARD_MULTIPLIERS.difficulty[card.difficulty]

  // Apply interval multiplier (spaced repetition bonus)
  multipliers.interval = FLASHCARD_MULTIPLIERS.interval[card.intervalStage]

  // Apply accuracy multiplier
  multipliers.accuracy = FLASHCARD_MULTIPLIERS.accuracy[card.responseQuality]

  // Calculate base XP with multipliers
  let totalXP = baseXP * multipliers.streak * multipliers.difficulty * multipliers.interval * multipliers.accuracy

  // Add time-based bonuses
  const currentHour = new Date().getHours()
  if (currentHour < 9) {
    bonuses.push({ name: 'Lève-tôt', value: FLASHCARD_BONUSES.morning_learner })
    totalXP += FLASHCARD_BONUSES.morning_learner
  } else if (currentHour >= 22) {
    bonuses.push({ name: 'Couche-tard', value: FLASHCARD_BONUSES.night_owl })
    totalXP += FLASHCARD_BONUSES.night_owl
  }

  // Weekend bonus
  const isWeekend = [0, 6].includes(new Date().getDay())
  if (isWeekend) {
    bonuses.push({ name: 'Guerrier du weekend', value: FLASHCARD_BONUSES.weekend_warrior })
    totalXP += FLASHCARD_BONUSES.weekend_warrior
  }

  // Combo bonuses
  const comboBonus = getComboBonus(session.currentCombo)
  if (comboBonus > 0) {
    bonuses.push({ name: `Combo x${session.currentCombo}`, value: comboBonus })
    totalXP += comboBonus
  }

  // Session milestones
  if (session.totalCardsToday >= 100) {
    bonuses.push({ name: 'Club des 100', value: FLASHCARD_BONUSES.century_club })
    totalXP += FLASHCARD_BONUSES.century_club
    achievements.push('century_club')
  }

  // Perfect session bonus
  if (session.perfectCards > 0 && session.perfectCards === session.totalCardsToday) {
    bonuses.push({ name: 'Session parfaite', value: FLASHCARD_BONUSES.perfect_session })
    totalXP += FLASHCARD_BONUSES.perfect_session
    achievements.push('perfect_session')
  }

  // Card mastery bonus (difficulty progression)
  if (card.difficulty === 'easy' && card.repetitions >= 3) {
    bonuses.push({ name: 'Maîtrise de carte', value: FLASHCARD_BONUSES.card_mastery })
    totalXP += FLASHCARD_BONUSES.card_mastery
    achievements.push('card_mastery')
  }

  return {
    baseXP: Math.round(baseXP),
    multipliers,
    bonuses,
    totalXP: Math.round(totalXP),
    achievements,
  }
}

/**
 * Get streak multiplier based on consecutive days
 */
function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return FLASHCARD_MULTIPLIERS.streak[30]
  if (streakDays >= 14) return FLASHCARD_MULTIPLIERS.streak[14]
  if (streakDays >= 7) return FLASHCARD_MULTIPLIERS.streak[7]
  if (streakDays >= 3) return FLASHCARD_MULTIPLIERS.streak[3]
  return 1
}

/**
 * Get combo bonus based on consecutive correct answers
 */
function getComboBonus(combo: number): number {
  if (combo >= 30) return FLASHCARD_BONUSES.combo_30
  if (combo >= 25) return FLASHCARD_BONUSES.combo_25
  if (combo >= 20) return FLASHCARD_BONUSES.combo_20
  if (combo >= 15) return FLASHCARD_BONUSES.combo_15
  if (combo >= 10) return FLASHCARD_BONUSES.combo_10
  if (combo >= 5) return FLASHCARD_BONUSES.combo_5
  return 0
}

/**
 * Determine card difficulty based on SM-2 ease factor
 */
export function getCardDifficulty(easeFactor: number): 'easy' | 'medium' | 'hard' {
  if (easeFactor >= 2800) return 'easy'    // High ease = easy card
  if (easeFactor >= 2200) return 'medium'  // Medium ease = medium card
  return 'hard'                            // Low ease = hard card
}

/**
 * Determine interval stage based on repetitions and last review
 */
export function getIntervalStage(repetitions: number, lastReviewedAt?: string): FlashcardCard['intervalStage'] {
  if (!lastReviewedAt || repetitions === 0) return 'first_review'

  const daysSinceReview = Math.floor(
    (Date.now() - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceReview >= 30) return 'long_term'
  if (daysSinceReview >= 14) return 'month_1'
  if (daysSinceReview >= 7) return 'week_2'
  if (daysSinceReview >= 4) return 'week_1'
  if (daysSinceReview >= 2) return 'day_3'
  if (daysSinceReview >= 1) return 'day_1'
  return 'first_review'
}

/**
 * Format XP breakdown for UI display
 */
export function formatXPBreakdown(result: XPCalculationResult): string[] {
  const breakdown: string[] = []

  // Base XP
  breakdown.push(`+${result.baseXP} XP (base)`)

  // Multipliers
  if (result.multipliers.streak > 1) {
    const bonus = Math.round((result.multipliers.streak - 1) * 100)
    breakdown.push(`+${bonus}% (série)`)
  }

  if (result.multipliers.difficulty !== 1) {
    const bonus = Math.round((result.multipliers.difficulty - 1) * 100)
    const sign = bonus > 0 ? '+' : ''
    breakdown.push(`${sign}${bonus}% (difficulté)`)
  }

  if (result.multipliers.interval > 1) {
    const bonus = Math.round((result.multipliers.interval - 1) * 100)
    breakdown.push(`+${bonus}% (révision espacée)`)
  }

  if (result.multipliers.accuracy !== 1) {
    const bonus = Math.round((result.multipliers.accuracy - 1) * 100)
    const sign = bonus > 0 ? '+' : ''
    breakdown.push(`${sign}${bonus}% (précision)`)
  }

  // Bonuses
  result.bonuses.forEach(bonus => {
    breakdown.push(`+${bonus.value} XP (${bonus.name})`)
  })

  return breakdown
}
