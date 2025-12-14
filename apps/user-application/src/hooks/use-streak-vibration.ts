import { useCallback, useRef } from 'react'
import { useVibration, VibrationPatterns } from '@/hooks'

/**
 * Hook for managing streak milestone vibrations in learning sessions
 */
export function useStreakVibration() {
  const [{ isSupported }, { vibrate }] = useVibration()
  const lastStreakRef = useRef<number>(0)

  const triggerStreakVibration = useCallback((currentStreak: number) => {
    if (!isSupported || currentStreak <= lastStreakRef.current)
      return

    // Trigger vibration for specific milestones
    if (currentStreak === 3) {
      vibrate(VibrationPatterns.streak.x3)
    }
    else if (currentStreak === 5) {
      vibrate(VibrationPatterns.streak.x5)
    }
    else if (currentStreak === 10) {
      vibrate(VibrationPatterns.streak.x10)
    }
    else if (currentStreak > 10 && currentStreak % 5 === 0) {
      // Every 5 after 10 (15, 20, 25, etc.)
      vibrate(VibrationPatterns.streak.x10)
    }

    lastStreakRef.current = currentStreak
  }, [isSupported, vibrate])

  const resetStreak = useCallback(() => {
    lastStreakRef.current = 0
  }, [])

  const triggerSessionComplete = useCallback(() => {
    if (!isSupported)
      return
    vibrate(VibrationPatterns.sessionComplete)
  }, [isSupported, vibrate])

  return {
    triggerStreakVibration,
    resetStreak,
    triggerSessionComplete,
    isSupported,
  }
}
