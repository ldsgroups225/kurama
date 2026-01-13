export interface SM2Input {
  quality: number // 0-5
  repetitions: number // n
  easeFactor: number // EF (stored as integer * 1000 in DB for precision, or as float)
  interval: number // I (in days)
}

export interface SM2Output {
  repetitions: number
  easeFactor: number
  interval: number
  nextReviewAt: string
}

/**
 * SuperMemo-2 Spaced Repetition Algorithm
 *
 * @param input Current SM2 state and assessment quality
 * @returns Updated SM2 state and next review date
 */
export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, easeFactor: efPrev } = input
  let { repetitions: n, interval: i } = input
  let ef = efPrev

  // Minimum ease factor is 1.3
  const MIN_EF = 1.3

  if (quality >= 3) {
    // Correct response
    if (n === 0) {
      i = 1
    }
    else if (n === 1) {
      i = 6
    }
    else {
      i = Math.ceil(i * ef)
    }
    n += 1
  }
  else {
    // Incorrect response
    n = 0
    i = 1
  }

  // Update ease factor: EF = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (ef < MIN_EF)
    ef = MIN_EF

  // Calculate next review date
  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + i)
  // Set to beginning of day for consistency
  nextReviewAt.setHours(0, 0, 0, 0)

  return {
    repetitions: n,
    easeFactor: ef,
    interval: i,
    nextReviewAt: nextReviewAt.toISOString(),
  }
}
