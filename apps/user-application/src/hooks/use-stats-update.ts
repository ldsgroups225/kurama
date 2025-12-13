import type { SessionStatsInput, SessionStatsResult } from '@/core/functions/stats'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { updateSessionStats } from '@/core/functions/stats'
import { getMutationQueueManager } from '@/lib/mutation-queue'
import { announceStatChange } from './use-announce'
import { useOnlineStatus } from './use-online-status'

export interface UseStatsUpdateOptions {
  onSuccess?: (result: SessionStatsResult) => void
  onError?: (error: Error) => void
  onLevelUp?: (newLevel: number) => void
  onAchievementUnlocked?: (achievements: string[]) => void
}

export function useStatsUpdate(options: UseStatsUpdateOptions = {}) {
  const queryClient = useQueryClient()
  const { isOnline } = useOnlineStatus()
  const [lastResult, setLastResult] = useState<SessionStatsResult | null>(null)

  const mutation = useMutation({
    mutationFn: async (input: SessionStatsInput) => {
      return updateSessionStats({ data: input })
    },
    onSuccess: (result) => {
      setLastResult(result)

      // Invalidate all relevant queries for realtime UI updates
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })

      // Invalidate lesson-related queries
      queryClient.invalidateQueries({ queryKey: ['lessons'] })

      // Announce stat changes for accessibility
      announceStatChange('xp', result.xpEarned)

      // Trigger callbacks
      options.onSuccess?.(result)

      if (result.leveledUp) {
        announceStatChange('level', result.currentLevel)
        options.onLevelUp?.(result.currentLevel)
      }

      if (result.achievementsUnlocked.length > 0) {
        result.achievementsUnlocked.forEach((achievement) => {
          announceStatChange('achievement', achievement)
        })
        options.onAchievementUnlocked?.(result.achievementsUnlocked)
      }
    },
    onError: (error) => {
      options.onError?.(error as Error)
    },
  })

  const updateStats = useCallback(
    async (input: SessionStatsInput): Promise<SessionStatsResult | null> => {
      if (!isOnline) {
        // Queue for offline sync
        const queueManager = getMutationQueueManager()
        await queueManager.enqueue({
          type: 'create',
          endpoint: '/api/stats/update',
          payload: input,
          optimisticData: {
            xpEarned: input.correctCount * 10,
            isPassing: (input.correctCount / input.totalCount) * 100 >= 80,
          },
          userId: 'current-user',
          dependencies: [],
        })

        // Return optimistic result for offline
        const percentage = input.totalCount > 0
          ? Math.round((input.correctCount / input.totalCount) * 100)
          : 0

        // Calculate offline XP based on mode
        const baseRates = {
          flashcards: 5,
          quiz: 10,
          exam: 12,
          'quick-review': 7,
        } as const
        const baseXP = input.correctCount * (baseRates[input.mode] || baseRates.flashcards)

        return {
          xpEarned: baseXP,
          xpBreakdown: {
            base: baseXP,
            streakBonus: 0,
            perfectBonus: 0,
            speedBonus: 0,
            passingBonus: percentage >= 80 ? 100 : 0,
          },
          totalXP: 0, // Unknown offline
          previousLevel: 0,
          currentLevel: 0,
          leveledUp: false,
          currentLevelXP: 0,
          nextLevelXP: 500,
          currentStreak: 0,
          achievementsUnlocked: [],
          isPassing: percentage >= 80,
          percentage,
          masteryCount: 0,
          isLessonCompleted: false,
          nextLessonUnlocked: false,
          nextLessonTitle: null,
        }
      }

      try {
        return await mutation.mutateAsync(input)
      }
      catch {
        return null
      }
    },
    [isOnline, mutation],
  )

  return {
    updateStats,
    isUpdating: mutation.isPending,
    lastResult,
    error: mutation.error,
  }
}
