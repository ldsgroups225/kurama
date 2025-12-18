/**
 * Unit tests for streak calculation utilities
 * 
 * Tests the core streak logic with various scenarios to ensure
 * consistent behavior across the application.
 */
/* 
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateStreakMultiplier,
  getStreakTier,
  calculateStreakBonus,
  isStreakAtRisk,
  getDaysUntilStreakBreaks,
  getUnlockedStreakAchievements,
  getNewlyUnlockedStreakAchievements,
  normalizeToDateString,
  getTodayDateString,
  getYesterdayDateString,
  STREAK_MULTIPLIER_TIERS,
  STREAK_ACHIEVEMENTS,
} from './streak'

// Mock Date for consistent testing
const mockDate = new Date('2024-01-15T10:00:00.000Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(mockDate)
})

describe('Date Utilities', () => {
  it('normalizes dates to YYYY-MM-DD format in server timezone', () => {
    const date = new Date('2024-01-15T23:30:00.000Z')
    const normalized = normalizeToDateString(date)
    expect(normalized).toBe('2024-01-15')
  })

  it('gets today date string', () => {
    const today = getTodayDateString()
    expect(today).toBe('2024-01-15')
  })

  it('gets yesterday date string', () => {
    const yesterday = getYesterdayDateString()
    expect(yesterday).toBe('2024-01-14')
  })
})

describe('Streak Multiplier Calculation', () => {
  it('returns 1.0x for streaks less than 3 days', () => {
    expect(calculateStreakMultiplier(0)).toBe(1.0)
    expect(calculateStreakMultiplier(1)).toBe(1.0)
    expect(calculateStreakMultiplier(2)).toBe(1.0)
  })

  it('returns 1.1x for 3-6 day streaks', () => {
    expect(calculateStreakMultiplier(3)).toBe(1.1)
    expect(calculateStreakMultiplier(4)).toBe(1.1)
    expect(calculateStreakMultiplier(6)).toBe(1.1)
  })

  it('returns 1.25x for 7-13 day streaks', () => {
    expect(calculateStreakMultiplier(7)).toBe(1.25)
    expect(calculateStreakMultiplier(10)).toBe(1.25)
    expect(calculateStreakMultiplier(13)).toBe(1.25)
  })

  it('returns 1.4x for 14-29 day streaks', () => {
    expect(calculateStreakMultiplier(14)).toBe(1.4)
    expect(calculateStreakMultiplier(20)).toBe(1.4)
    expect(calculateStreakMultiplier(29)).toBe(1.4)
  })

  it('returns 1.5x for 30+ day streaks', () => {
    expect(calculateStreakMultiplier(30)).toBe(1.5)
    expect(calculateStreakMultiplier(50)).toBe(1.5)
    expect(calculateStreakMultiplier(100)).toBe(1.5)
  })
})

describe('Streak Tier Information', () => {
  it('returns correct tier for each streak range', () => {
    const tier0 = getStreakTier(0)
    expect(tier0.multiplier).toBe(1.0)
    expect(tier0.bonusPercent).toBe(0)
    expect(tier0.label).toBe('Aucun bonus')

    const tier7 = getStreakTier(7)
    expect(tier7.multiplier).toBe(1.25)
    expect(tier7.bonusPercent).toBe(25)
    expect(tier7.label).toBe('1+ semaine')

    const tier30 = getStreakTier(30)
    expect(tier30.multiplier).toBe(1.5)
    expect(tier30.bonusPercent).toBe(50)
    expect(tier30.label).toBe('30+ jours')
  })
})

describe('Streak Bonus Calculation', () => {
  it('calculates correct bonus amounts', () => {
    const baseXP = 100

    // No bonus for < 3 days
    expect(calculateStreakBonus(baseXP, 2)).toBe(0)

    // 10% bonus for 3+ days
    expect(calculateStreakBonus(baseXP, 3)).toBe(10)

    // 25% bonus for 7+ days
    expect(calculateStreakBonus(baseXP, 7)).toBe(25)

    // 40% bonus for 14+ days
    expect(calculateStreakBonus(baseXP, 14)).toBe(40)

    // 50% bonus for 30+ days
    expect(calculateStreakBonus(baseXP, 30)).toBe(50)
  })

  it('rounds bonus amounts correctly', () => {
    const baseXP = 83 // Odd number to test rounding

    // 25% of 83 = 20.75, should round to 21
    expect(calculateStreakBonus(baseXP, 7)).toBe(21)
  })
})

describe('Streak Risk Assessment', () => {
  it('identifies when streak is at risk', () => {
    const yesterday = '2024-01-14'
    const today = '2024-01-15'
    const twoDaysAgo = '2024-01-13'

    expect(isStreakAtRisk(yesterday)).toBe(true) // Studied yesterday, not today
    expect(isStreakAtRisk(today)).toBe(false) // Studied today
    expect(isStreakAtRisk(twoDaysAgo)).toBe(false) // Already broken
    expect(isStreakAtRisk(null)).toBe(false) // No sessions
  })

  it('calculates days until streak breaks', () => {
    const yesterday = '2024-01-14'
    const today = '2024-01-15'
    const twoDaysAgo = '2024-01-13'

    expect(getDaysUntilStreakBreaks(today)).toBe(2) // Safe, studied today
    expect(getDaysUntilStreakBreaks(yesterday)).toBe(1) // At risk, need to study today
    expect(getDaysUntilStreakBreaks(twoDaysAgo)).toBe(0) // Already broken
    expect(getDaysUntilStreakBreaks(null)).toBe(0) // No sessions
  })
})

describe('Streak Achievements', () => {
  it('returns unlocked achievements for current streak', () => {
    const achievements3 = getUnlockedStreakAchievements(3)
    expect(achievements3).toEqual(['streak-3'])

    const achievements7 = getUnlockedStreakAchievements(7)
    expect(achievements7).toEqual(['streak-3', 'streak-7'])

    const achievements30 = getUnlockedStreakAchievements(30)
    expect(achievements30).toEqual(['streak-3', 'streak-7', 'streak-14', 'streak-30'])

    const achievements100 = getUnlockedStreakAchievements(100)
    expect(achievements100).toEqual([
      'streak-3', 'streak-7', 'streak-14', 'streak-30', 'streak-60', 'streak-100'
    ])
  })

  it('returns newly unlocked achievements', () => {
    // From 2 to 3 days - unlock streak-3
    const new3 = getNewlyUnlockedStreakAchievements(2, 3)
    expect(new3).toEqual(['streak-3'])

    // From 6 to 7 days - unlock streak-7
    const new7 = getNewlyUnlockedStreakAchievements(6, 7)
    expect(new7).toEqual(['streak-7'])

    // From 13 to 14 days - unlock streak-14
    const new14 = getNewlyUnlockedStreakAchievements(13, 14)
    expect(new14).toEqual(['streak-14'])

    // From 5 to 6 days - no new achievements
    const none = getNewlyUnlockedStreakAchievements(5, 6)
    expect(none).toEqual([])

    // From 29 to 30 days - unlock streak-30
    const new30 = getNewlyUnlockedStreakAchievements(29, 30)
    expect(new30).toEqual(['streak-30'])
  })

  it('handles achievement data correctly', () => {
    expect(STREAK_ACHIEVEMENTS['streak-3']).toEqual({
      days: 3,
      name: 'Série 3 jours',
      rarity: 'common'
    })

    expect(STREAK_ACHIEVEMENTS['streak-30']).toEqual({
      days: 30,
      name: 'Série 30 jours',
      rarity: 'legendary'
    })
  })
})

describe('Streak Multiplier Tiers', () => {
  it('has correct tier configuration', () => {
    expect(STREAK_MULTIPLIER_TIERS).toHaveLength(5)

    // Tiers should be ordered from highest to lowest minDays
    expect(STREAK_MULTIPLIER_TIERS[0]?.minDays).toBe(30)
    expect(STREAK_MULTIPLIER_TIERS[1]?.minDays).toBe(14)
    expect(STREAK_MULTIPLIER_TIERS[2]?.minDays).toBe(7)
    expect(STREAK_MULTIPLIER_TIERS[3]?.minDays).toBe(3)
    expect(STREAK_MULTIPLIER_TIERS[4]?.minDays).toBe(0)

    // Check multipliers match calculateStreakMultiplier function
    expect(STREAK_MULTIPLIER_TIERS[0]?.multiplier).toBe(1.5)
    expect(STREAK_MULTIPLIER_TIERS[1]?.multiplier).toBe(1.4)
    expect(STREAK_MULTIPLIER_TIERS[2]?.multiplier).toBe(1.25)
    expect(STREAK_MULTIPLIER_TIERS[3]?.multiplier).toBe(1.1)
    expect(STREAK_MULTIPLIER_TIERS[4]?.multiplier).toBe(1.0)
  })
})
 */
