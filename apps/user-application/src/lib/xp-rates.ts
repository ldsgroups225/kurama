/**
 * XP rates for different learning modes
 * Used for UI display and offline calculations
 */
export const XP_RATES = {
  'flashcards': 8, // Enhanced: Self-assessed review with gamification
  'quiz': 10, // Objective assessment
  'exam': 12, // Timed + objective
  'quick-review': 7, // Targeted review of difficult cards
} as const

export type LearningMode = keyof typeof XP_RATES

/**
 * Get XP rate for a specific mode
 */
export function getXPRate(mode: LearningMode): number {
  return XP_RATES[mode] || XP_RATES.flashcards
}

/**
 * Get XP rate display text for UI
 */
export function getXPRateText(mode: LearningMode): string {
  const rate = getXPRate(mode)
  return `${rate} XP par carte`
}

/**
 * Get mode description for UI
 */
export function getModeDescription(mode: LearningMode): string {
  const descriptions = {
    'flashcards': 'Révision avec système de gamification avancé',
    'quiz': 'Questions à choix multiples et vrai/faux',
    'exam': 'Simulation d\'examen chronométrée',
    'quick-review': 'Révision ciblée des cartes difficiles',
  } as const

  return descriptions[mode] || descriptions.flashcards
}

/**
 * Get mode difficulty indicator
 */
export function getModeDifficulty(mode: LearningMode): 'easy' | 'medium' | 'hard' {
  const difficulty = {
    'flashcards': 'easy',
    'quick-review': 'medium',
    'quiz': 'medium',
    'exam': 'hard',
  } as const

  return difficulty[mode] || 'easy'
}
