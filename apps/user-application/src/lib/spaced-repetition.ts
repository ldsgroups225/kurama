/**
 * SM-2 Spaced Repetition Algorithm
 *
 * This implements the SuperMemo 2 algorithm for calculating optimal review intervals
 * for flashcards based on user performance.
 *
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export interface SM2Result {
  /** Next review interval in days */
  interval: number
  /** Repetition count */
  repetitions: number
  /** Easiness factor (1.3 - 2.5) */
  easinessFactor: number
  /** Next review date timestamp */
  nextReviewDate: number
}

export interface CardProgress {
  /** Number of times reviewed */
  repetitions: number
  /** Current easiness factor */
  easinessFactor: number
  /** Current interval in days */
  interval: number
  /** Last review timestamp */
  lastReview: number
}

/**
 * Calculate next review using SM-2 algorithm
 *
 * @param quality - Quality of recall (0-5):
 *   - 0: Complete blackout
 *   - 1: Incorrect response, but correct one seemed familiar
 *   - 2: Incorrect response, but correct one remembered
 *   - 3: Correct response, but with difficulty
 *   - 4: Correct response with hesitation
 *   - 5: Perfect response
 * @param progress - Current card progress (optional, defaults to new card)
 * @returns Next review schedule
 */
export function calculateNextReview(
  quality: number,
  progress?: CardProgress,
): SM2Result {
  // Validate quality (0-5)
  const q = Math.max(0, Math.min(5, Math.floor(quality)))

  // Initialize defaults for new cards
  let repetitions = progress?.repetitions ?? 0
  let easinessFactor = progress?.easinessFactor ?? 2.5
  let interval = progress?.interval ?? 0

  // Calculate new easiness factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easinessFactor = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  )

  // If quality < 3, reset repetitions and interval
  if (q < 3) {
    repetitions = 0
    interval = 0
  }
  else {
    // Increment repetitions
    repetitions += 1

    // Calculate new interval
    if (repetitions === 1) {
      interval = 1 // 1 day
    }
    else if (repetitions === 2) {
      interval = 6 // 6 days
    }
    else {
      // I(n) = I(n-1) * EF
      interval = Math.round(interval * easinessFactor)
    }
  }

  // Calculate next review date
  const now = Date.now()
  const nextReviewDate = now + interval * 24 * 60 * 60 * 1000

  return {
    interval,
    repetitions,
    easinessFactor,
    nextReviewDate,
  }
}

/**
 * Convert response type to SM-2 quality score
 *
 * @param response - User response ('correct' or 'incorrect')
 * @param confidence - Optional confidence level ('easy', 'medium', 'hard')
 * @returns Quality score (0-5)
 */
export function responseToQuality(
  response: 'correct' | 'incorrect',
  confidence?: 'easy' | 'medium' | 'hard',
): number {
  if (response === 'incorrect') {
    return 0 // Complete blackout
  }

  // Map confidence to quality
  switch (confidence) {
    case 'easy':
      return 5 // Perfect response
    case 'medium':
      return 4 // Correct with hesitation
    case 'hard':
      return 3 // Correct with difficulty
    default:
      return 4 // Default to medium confidence
  }
}

/**
 * Check if a card is due for review
 *
 * @param progress - Card progress
 * @returns True if card is due for review
 */
export function isCardDue(progress: CardProgress): boolean {
  const now = Date.now()
  const nextReview = progress.lastReview + progress.interval * 24 * 60 * 60 * 1000
  return now >= nextReview
}

/**
 * Get cards due for review from a list
 *
 * @param cards - Array of cards with progress
 * @returns Cards that are due for review
 */
export function getDueCards<T extends { progress?: CardProgress }>(cards: T[]): T[] {
  return cards.filter((card) => {
    if (!card.progress) {
      return true // New cards are always due
    }
    return isCardDue(card.progress)
  })
}

/**
 * Calculate study statistics
 *
 * @param cards - Array of cards with progress
 * @returns Study statistics
 */
export function calculateStudyStats<T extends { progress?: CardProgress }>(cards: T[]): {
  total: number
  new: number
  learning: number
  review: number
  mastered: number
} {
  const stats = {
    total: cards.length,
    new: 0,
    learning: 0,
    review: 0,
    mastered: 0,
  }

  for (const card of cards) {
    if (!card.progress || card.progress.repetitions === 0) {
      stats.new++
    }
    else if (card.progress.repetitions < 3) {
      stats.learning++
    }
    else if (card.progress.easinessFactor >= 2.5) {
      stats.mastered++
    }
    else {
      stats.review++
    }
  }

  return stats
}
