/**
 * Kurama-specific vibration patterns for learning interactions
 */
export const VibrationPatterns = {
  // Basic patterns
  /** Short 100ms vibration for subtle feedback */
  tap: 100,
  /** Standard 200ms vibration */
  standard: 200,
  /** Longer 500ms vibration for emphasis */
  heavy: 500,

  // Common interaction patterns
  /** Double-tap pattern: vibrate-pause-vibrate */
  double: [100, 30, 100],
  /** Triple-tap pattern: vibrate-pause-vibrate-pause-vibrate */
  triple: [100, 30, 100, 30, 100],
  /** Success feedback pattern */
  success: [100, 50, 200],
  /** Error or warning pattern - longer and more noticeable */
  error: [300, 100, 500],

  // Flashcard mode patterns
  /** Streak milestones */
  streak: {
    x3: [50, 30, 50, 30, 50],
    x5: [100, 50, 100, 50, 100],
    x10: [200, 100, 200],
  },
  /** Session completion victory pattern */
  sessionComplete: [100, 50, 150],

  // Quiz mode patterns
  /** Time warning - urgent pattern */
  timeWarning: [100, 100, 100, 100],
  /** Question advance - soft confirmation */
  questionAdvance: [40],
  /** Combo achievements */
  combo: {
    x2: [80, 40, 80],
    x3: [100, 50, 100, 50, 100],
    x5: [150, 75, 150, 75, 150],
  },
  /** Quiz completion based on score */
  quizComplete: (score: number): number[] => {
    if (score >= 90)
      return [200, 100, 200, 100, 250]
    if (score >= 70)
      return [150, 75, 150]
    return [100]
  },

  // Gamification patterns
  /** XP gain - intensity matches XP amount */
  xpGain: (amount: number): number[] => [Math.min(amount * 2, 200)],
  /** Level up celebration */
  levelUp: [100, 50, 150, 50, 200],

  // Achievement patterns by rarity
  achievement: {
    common: [100],
    rare: [100, 100, 100],
    epic: [150, 100, 200],
    legendary: [200, 150, 250, 150, 300],
  },

  // Additional utility patterns
  /** Pattern for notifications */
  notification: [200, 100, 100],
  /** Heartbeat-like pattern */
  heartbeat: [100, 100, 100, 400],
}
