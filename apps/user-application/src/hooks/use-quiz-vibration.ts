import { useCallback, useRef } from 'react'
import { useVibration, VibrationPatterns } from '@/hooks'

/**
 * Hook for managing quiz mode vibrations
 */
export function useQuizVibration() {
  const [{ isSupported }, { vibrate }] = useVibration()
  const lastComboRef = useRef<number>(0)

  const triggerQuestionAdvance = useCallback(() => {
    if (!isSupported) return
    vibrate(VibrationPatterns.questionAdvance)
  }, [isSupported, vibrate])

  const triggerTimeWarning = useCallback(() => {
    if (!isSupported) return
    vibrate(VibrationPatterns.timeWarning)
  }, [isSupported, vibrate])

  const triggerComboVibration = useCallback((currentCombo: number) => {
    if (!isSupported || currentCombo <= lastComboRef.current) return

    // Trigger vibration for specific combo milestones
    if (currentCombo === 2) {
      vibrate(VibrationPatterns.combo.x2)
    } else if (currentCombo === 3) {
      vibrate(VibrationPatterns.combo.x3)
    } else if (currentCombo === 5) {
      vibrate(VibrationPatterns.combo.x5)
    } else if (currentCombo > 5 && currentCombo % 3 === 0) {
      // Every 3 after 5 (6, 9, 12, etc.)
      vibrate(VibrationPatterns.combo.x5)
    }

    lastComboRef.current = currentCombo
  }, [isSupported, vibrate])

  const resetCombo = useCallback(() => {
    lastComboRef.current = 0
  }, [])

  const triggerQuizComplete = useCallback((score: number) => {
    if (!isSupported) return
    vibrate(VibrationPatterns.quizComplete(score))
  }, [isSupported, vibrate])

  return {
    triggerQuestionAdvance,
    triggerTimeWarning,
    triggerComboVibration,
    resetCombo,
    triggerQuizComplete,
    isSupported,
  }
}
