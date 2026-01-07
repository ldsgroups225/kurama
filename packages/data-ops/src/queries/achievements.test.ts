import { describe, it, expect } from 'vitest'
import {
  ACHIEVEMENTS,
  getAchievementById,
  getAchievementsByCategory,
  getAchievementsByRarity,
} from './achievements'

describe('Achievement Registry', () => {
  describe('ACHIEVEMENTS constant', () => {
    it('should contain 19 achievements', () => {
      expect(ACHIEVEMENTS).toHaveLength(19)
    })

    it('should have achievements across all rarity tiers', () => {
      const rarities = ACHIEVEMENTS.map(a => a.rarity)
      expect(rarities).toContain('common')
      expect(rarities).toContain('rare')
      expect(rarities).toContain('epic')
      expect(rarities).toContain('legendary')
    })

    it('should have achievements across all categories', () => {
      const categories = ACHIEVEMENTS.map(a => a.category)
      expect(categories).toContain('cards')
      expect(categories).toContain('streak')
      expect(categories).toContain('xp')
      expect(categories).toContain('lessons')
      expect(categories).toContain('special')
    })

    it('should have unique achievement IDs', () => {
      const ids = ACHIEVEMENTS.map(a => a.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ACHIEVEMENTS.length)
    })

    it('should have valid condition types', () => {
      const validTypes = ['cards_studied', 'streak_days', 'xp_earned', 'lessons_completed', 'study_days', 'subjects_studied']
      ACHIEVEMENTS.forEach(achievement => {
        expect(validTypes).toContain(achievement.condition.type)
        expect(achievement.condition.threshold).toBeGreaterThan(0)
      })
    })

    it('should have proper French names and descriptions', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement.name).toBeTruthy()
        expect(achievement.description).toBeTruthy()
        expect(achievement.icon).toBeTruthy()
        expect(typeof achievement.name).toBe('string')
        expect(typeof achievement.description).toBe('string')
        expect(typeof achievement.icon).toBe('string')
      })
    })
  })

  describe('Helper functions', () => {
    describe('getAchievementById', () => {
      it('should return achievement by ID', () => {
        const achievement = getAchievementById('first-step')
        expect(achievement).toBeDefined()
        expect(achievement?.id).toBe('first-step')
        expect(achievement?.name).toBe('Premier Pas')
        expect(achievement?.rarity).toBe('common')
      })

      it('should return undefined for non-existent ID', () => {
        const achievement = getAchievementById('non-existent')
        expect(achievement).toBeUndefined()
      })
    })

    describe('getAchievementsByCategory', () => {
      it('should return achievements by category', () => {
        const cardAchievements = getAchievementsByCategory('cards')
        expect(cardAchievements.length).toBeGreaterThan(0)
        cardAchievements.forEach(achievement => {
          expect(achievement.category).toBe('cards')
        })
      })

      it('should return streak achievements', () => {
        const streakAchievements = getAchievementsByCategory('streak')
        expect(streakAchievements.length).toBe(5) // 5 streak achievements
        streakAchievements.forEach(achievement => {
          expect(achievement.category).toBe('streak')
          expect(achievement.condition.type).toBe('streak_days')
        })
      })

      it('should return empty array for non-existent category', () => {
        const achievements = getAchievementsByCategory('non-existent' as any)
        expect(achievements).toHaveLength(0)
      })
    })

    describe('getAchievementsByRarity', () => {
      it('should return achievements by rarity', () => {
        const commonAchievements = getAchievementsByRarity('common')
        expect(commonAchievements.length).toBeGreaterThan(0)
        commonAchievements.forEach(achievement => {
          expect(achievement.rarity).toBe('common')
        })
      })

      it('should have correct rarity distribution', () => {
        const common = getAchievementsByRarity('common')
        const rare = getAchievementsByRarity('rare')
        const epic = getAchievementsByRarity('epic')
        const legendary = getAchievementsByRarity('legendary')

        expect(common.length).toBe(4)
        expect(rare.length).toBe(5)
        expect(epic.length).toBe(5)
        expect(legendary.length).toBe(5) // 5 legendary achievements
      })

      it('should have proper threshold progression by rarity', () => {
        // Common achievements should have low thresholds
        const common = getAchievementsByRarity('common')
        common.forEach(achievement => {
          expect(achievement.condition.threshold).toBeLessThanOrEqual(10)
        })

        // Legendary achievements should have high thresholds
        const legendary = getAchievementsByRarity('legendary')
        legendary.forEach(achievement => {
          expect(achievement.condition.threshold).toBeGreaterThanOrEqual(25)
        })
      })
    })
  })

  describe('Achievement Definitions Validation', () => {
    it('should have specific key achievements', () => {
      const keyAchievements = [
        'first-step',
        'cards-100',
        'streak-7',
        'xp-1000',
        'cards-1000',
        'streak-100'
      ]

      keyAchievements.forEach(id => {
        const achievement = getAchievementById(id)
        expect(achievement).toBeDefined()
        expect(achievement?.id).toBe(id)
      })
    })

    it('should have proper icon assignments', () => {
      const expectedIcons = [
        'Sparkles', 'GraduationCap', 'Flame', 'Eye', 'Target',
        'BookOpen', 'Zap', 'Calendar', 'BookMarked', 'Trophy',
        'Library', 'CalendarCheck', 'Crown', 'Medal', 'Star'
      ]

      const usedIcons = ACHIEVEMENTS.map(a => a.icon)
      expectedIcons.forEach(icon => {
        expect(usedIcons).toContain(icon)
      })
    })

    it('should have achievements for all major milestones', () => {
      // Cards milestones
      const cardMilestones = [1, 10, 100, 500, 1000]
      cardMilestones.forEach(milestone => {
        const achievement = ACHIEVEMENTS.find(a =>
          a.condition.type === 'cards_studied' &&
          a.condition.threshold === milestone
        )
        expect(achievement).toBeDefined()
      })

      // Streak milestones
      const streakMilestones = [3, 7, 14, 30, 100]
      streakMilestones.forEach(milestone => {
        const achievement = ACHIEVEMENTS.find(a =>
          a.condition.type === 'streak_days' &&
          a.condition.threshold === milestone
        )
        expect(achievement).toBeDefined()
      })

      // XP milestones
      const xpMilestones = [1000, 5000, 10000]
      xpMilestones.forEach(milestone => {
        const achievement = ACHIEVEMENTS.find(a =>
          a.condition.type === 'xp_earned' &&
          a.condition.threshold === milestone
        )
        expect(achievement).toBeDefined()
      })
    })
  })
})
