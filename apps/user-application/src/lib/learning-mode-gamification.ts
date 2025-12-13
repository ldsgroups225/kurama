/**
 * Enhanced Gamification System for All Learning Modes
 * Extends flashcard gamification to quiz and exam modes
 */

export interface LearningSession {
  mode: 'flashcards' | 'quiz' | 'exam' | 'quick-review'
  streakDays: number
  currentCombo: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  sessionStartTime: Date
  averageTimePerQuestion: number
  perfectAnswers: number // Answered correctly on first try
  struggledAnswers: number // Took multiple attempts or long time
}

export interface LearningQuestion {
  id: number
  difficulty: 'easy' | 'medium' | 'hard'
  timeSpent: number // seconds
  attempts: number
  isCorrect: boolean
  responseTime: number
  questionType: 'multiple-choice' | 'true-false' | 'written' | 'flashcard'
}

export interface EnhancedXPResult {
  baseXP: number
  modeMultiplier: number
  bonuses: {
    name: string
    value: number
    description: string
  }[]
  penalties: {
    name: string
    value: number
    description: string
  }[]
  totalXP: number
  achievements: string[]
  streakBonus: number
  accuracyBonus: number
  speedBonus: number
  difficultyBonus: number
}

/**
 * Enhanced XP rates with mode-specific bonuses
 */
export const ENHANCED_MODE_XP_RATES = {
  'flashcards': 8, // Self-assessed with gamification
  'quiz': 10, // Objective assessment
  'exam': 12, // Timed + objective, highest stakes
  'quick-review': 7, // Targeted review
} as const

/**
 * Mode-specific multipliers and bonuses
 */
export const MODE_MULTIPLIERS = {
  // Base difficulty multipliers per mode
  difficulty: {
    'flashcards': { easy: 0.8, medium: 1.0, hard: 1.3 },
    'quiz': { easy: 0.9, medium: 1.0, hard: 1.2 },
    'exam': { easy: 1.0, medium: 1.1, hard: 1.3 },
    'quick-review': { easy: 0.8, medium: 1.0, hard: 1.4 },
  },

  // Speed bonuses (seconds per question)
  speed: {
    'flashcards': { threshold: 5, bonus: 1.2 }, // Quick recall
    'quiz': { threshold: 15, bonus: 1.15 }, // Quick thinking
    'exam': { threshold: 30, bonus: 1.1 }, // Efficient under pressure
    'quick-review': { threshold: 8, bonus: 1.25 }, // Quick mastery
  },

  // Accuracy bonuses
  accuracy: {
    'flashcards': { perfect: 1.2, good: 1.0, struggled: 0.9 },
    'quiz': { perfect: 1.3, good: 1.0, struggled: 0.8 }, // Higher penalty for wrong answers
    'exam': { perfect: 1.4, good: 1.0, struggled: 0.7 }, // Highest stakes
    'quick-review': { perfect: 1.25, good: 1.0, struggled: 0.85 },
  },
} as const

/**
 * Mode-specific achievement bonuses
 */
export const MODE_BONUSES = {
  // Perfect performance bonuses
  perfect_score: {
    'flashcards': 50,
    'quiz': 75,
    'exam': 100,
    'quick-review': 60,
  },

  // Speed demon bonuses (very fast completion)
  speed_demon: {
    'flashcards': 25,
    'quiz': 40,
    'exam': 60,
    'quick-review': 35,
  },

  // Combo bonuses (consecutive correct answers)
  combo_5: {
    'flashcards': 15,
    'quiz': 20,
    'exam': 30,
    'quick-review': 18,
  },

  combo_10: {
    'flashcards': 35,
    'quiz': 50,
    'exam': 75,
    'quick-review': 40,
  },

  combo_15: {
    'flashcards': 60,
    'quiz': 85,
    'exam': 125,
    'quick-review': 70,
  },

  // First attempt bonuses (no mistakes)
  flawless_run: {
    'flashcards': 40,
    'quiz': 60,
    'exam': 100,
    'quick-review': 50,
  },

  // Difficulty mastery bonuses
  hard_questions_master: {
    'flashcards': 30,
    'quiz': 45,
    'exam': 70,
    'quick-review': 55,
  },
} as const

/**
 * Calculate enhanced XP for any learning mode
 */
export function calculateLearningModeXP(
  session: LearningSession,
  questions: LearningQuestion[],
): EnhancedXPResult {
  const { mode, streakDays, currentCombo, correctAnswers, totalQuestions } = session

  const baseRate = ENHANCED_MODE_XP_RATES[mode]
  const baseXP = correctAnswers * baseRate

  const bonuses: EnhancedXPResult['bonuses'] = []
  const penalties: EnhancedXPResult['penalties'] = []
  const achievements: string[] = []

  // Variables for future use in more complex calculations
  // const totalMultiplier = 1
  // const totalBonusXP = 0

  // 1. Streak bonus (applies to all modes)
  const streakMultiplier = calculateStreakMultiplier(streakDays)
  const streakBonus = Math.round(baseXP * (streakMultiplier - 1))
  if (streakBonus > 0) {
    bonuses.push({
      name: `Série ${streakDays} jours`,
      value: streakBonus,
      description: `+${Math.round((streakMultiplier - 1) * 100)}% bonus de série`,
    })
  }

  // 2. Accuracy bonus/penalty
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0
  const accuracyMultiplier = calculateAccuracyMultiplier(mode, accuracy)
  const accuracyBonus = Math.round(baseXP * (accuracyMultiplier - 1))
  if (accuracyBonus > 0) {
    bonuses.push({
      name: 'Précision',
      value: accuracyBonus,
      description: `${Math.round(accuracy * 100)}% de réussite`,
    })
  }
  else if (accuracyBonus < 0) {
    penalties.push({
      name: 'Précision',
      value: Math.abs(accuracyBonus),
      description: `${Math.round(accuracy * 100)}% de réussite`,
    })
  }

  // 3. Speed bonus
  const avgTimePerQuestion = session.averageTimePerQuestion
  const speedThreshold = MODE_MULTIPLIERS.speed[mode].threshold
  const speedMultiplier = MODE_MULTIPLIERS.speed[mode].bonus

  if (avgTimePerQuestion > 0 && avgTimePerQuestion <= speedThreshold) {
    const speedBonus = Math.round(baseXP * (speedMultiplier - 1))
    bonuses.push({
      name: 'Vitesse',
      value: speedBonus,
      description: `Moyenne ${avgTimePerQuestion.toFixed(1)}s par question`,
    })

    // Speed demon achievement
    if (avgTimePerQuestion <= speedThreshold * 0.7) {
      const speedDemonBonus = MODE_BONUSES.speed_demon[mode]
      bonuses.push({
        name: 'Éclair',
        value: speedDemonBonus,
        description: 'Vitesse exceptionnelle',
      })
      achievements.push('speed_demon')
    }
  }

  // 4. Difficulty bonus
  const hardQuestions = questions.filter(q => q.difficulty === 'hard' && q.isCorrect)
  if (hardQuestions.length >= Math.ceil(totalQuestions * 0.5)) {
    const difficultyBonus = MODE_BONUSES.hard_questions_master[mode]
    bonuses.push({
      name: 'Maître des défis',
      value: difficultyBonus,
      description: `${hardQuestions.length} questions difficiles réussies`,
    })
    achievements.push('hard_questions_master')
  }

  // 5. Perfect score bonus
  if (accuracy === 1.0 && totalQuestions > 0) {
    const perfectBonus = MODE_BONUSES.perfect_score[mode]
    bonuses.push({
      name: 'Score parfait',
      value: perfectBonus,
      description: '100% de réussite',
    })
    achievements.push('perfect_score')
  }

  // 6. Combo bonuses
  if (currentCombo >= 15) {
    const comboBonus = MODE_BONUSES.combo_15[mode]
    bonuses.push({
      name: `Combo x${currentCombo}`,
      value: comboBonus,
      description: 'Série exceptionnelle',
    })
    achievements.push('combo_master')
  }
  else if (currentCombo >= 10) {
    const comboBonus = MODE_BONUSES.combo_10[mode]
    bonuses.push({
      name: `Combo x${currentCombo}`,
      value: comboBonus,
      description: 'Excellente série',
    })
    achievements.push('combo_expert')
  }
  else if (currentCombo >= 5) {
    const comboBonus = MODE_BONUSES.combo_5[mode]
    bonuses.push({
      name: `Combo x${currentCombo}`,
      value: comboBonus,
      description: 'Bonne série',
    })
    achievements.push('combo_starter')
  }

  // 7. Flawless run bonus (no wrong answers)
  const hasNoMistakes = questions.every(q => q.attempts === 1 && q.isCorrect)
  if (hasNoMistakes && totalQuestions >= 5) {
    const flawlessBonus = MODE_BONUSES.flawless_run[mode]
    bonuses.push({
      name: 'Parcours sans faute',
      value: flawlessBonus,
      description: 'Aucune erreur commise',
    })
    achievements.push('flawless_run')
  }

  // 8. Mode-specific bonuses
  if (mode === 'exam') {
    // Exam pressure bonus
    if (accuracy >= 0.9 && avgTimePerQuestion <= speedThreshold) {
      bonuses.push({
        name: 'Maître sous pression',
        value: 80,
        description: 'Excellence en mode examen',
      })
      achievements.push('exam_master')
    }
  }
  else if (mode === 'quiz') {
    // Quick thinking bonus
    if (accuracy >= 0.85 && avgTimePerQuestion <= speedThreshold * 0.8) {
      bonuses.push({
        name: 'Pensée rapide',
        value: 50,
        description: 'Réflexion et vitesse combinées',
      })
      achievements.push('quick_thinker')
    }
  }

  // Calculate totals
  const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.value, 0)
  const totalPenalties = penalties.reduce((sum, penalty) => sum + penalty.value, 0)

  const finalXP = Math.round(
    baseXP * streakMultiplier * accuracyMultiplier + totalBonuses - totalPenalties,
  )

  return {
    baseXP,
    modeMultiplier: 1, // Could be used for future mode-specific multipliers
    bonuses,
    penalties,
    totalXP: Math.max(0, finalXP), // Ensure XP never goes negative
    achievements,
    streakBonus,
    accuracyBonus,
    speedBonus: bonuses.find(b => b.name === 'Vitesse')?.value || 0,
    difficultyBonus: bonuses.find(b => b.name === 'Maître des défis')?.value || 0,
  }
}

/**
 * Calculate streak multiplier
 */
function calculateStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30)
    return 1.5 // 50% bonus for 30+ days
  if (streakDays >= 14)
    return 1.4 // 40% bonus for 2+ weeks
  if (streakDays >= 7)
    return 1.25 // 25% bonus for 1+ week
  if (streakDays >= 3)
    return 1.1 // 10% bonus for 3+ days
  return 1
}

/**
 * Calculate accuracy multiplier based on mode
 */
function calculateAccuracyMultiplier(
  mode: keyof typeof MODE_MULTIPLIERS.accuracy,
  accuracy: number,
): number {
  const modeAccuracy = MODE_MULTIPLIERS.accuracy[mode]

  if (accuracy === 1.0)
    return modeAccuracy.perfect
  if (accuracy >= 0.8)
    return modeAccuracy.good
  return modeAccuracy.struggled
}

/**
 * Get mode-specific XP rate for UI display
 */
export function getModeXPRate(mode: keyof typeof ENHANCED_MODE_XP_RATES): number {
  return ENHANCED_MODE_XP_RATES[mode]
}

/**
 * Get mode difficulty description
 */
export function getModeDifficultyDescription(mode: keyof typeof ENHANCED_MODE_XP_RATES): string {
  const descriptions = {
    'flashcards': 'Auto-évaluation avec gamification avancée',
    'quiz': 'Évaluation objective avec bonus de vitesse',
    'exam': 'Simulation haute pression avec récompenses maximales',
    'quick-review': 'Révision ciblée avec bonus de maîtrise',
  }

  return descriptions[mode]
}

/**
 * Calculate potential XP for preview (before session starts)
 */
export function calculatePotentialXP(
  mode: keyof typeof ENHANCED_MODE_XP_RATES,
  questionCount: number,
  estimatedAccuracy: number = 0.8,
): { min: number, max: number, expected: number } {
  const baseRate = ENHANCED_MODE_XP_RATES[mode]
  const baseXP = questionCount * baseRate * estimatedAccuracy

  // Minimum (no bonuses, average performance)
  const minXP = Math.round(baseXP * 0.8)

  // Maximum (all bonuses, perfect performance)
  const maxBonuses = MODE_BONUSES.perfect_score[mode]
    + MODE_BONUSES.speed_demon[mode]
    + MODE_BONUSES.combo_15[mode]
    + MODE_BONUSES.flawless_run[mode]
  const maxXP = Math.round(baseXP * 1.5 + maxBonuses) // 1.5x for streak + accuracy

  // Expected (realistic bonuses)
  const expectedXP = Math.round(baseXP * 1.2 + MODE_BONUSES.combo_5[mode])

  return { min: minXP, max: maxXP, expected: expectedXP }
}
