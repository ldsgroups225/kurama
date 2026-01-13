/**
 * Achievement Registry
 * 
 * Centralized definitions for all achievements with:
 * - Unique IDs
 * - Rarity levels
 * - Unlock conditions
 * - Progress tracking
 * - Icons
 */

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  rarity: AchievementRarity
  category: 'cards' | 'streak' | 'xp' | 'lessons' | 'special'
  condition: {
    type: 'cards_studied' | 'streak_days' | 'xp_earned' | 'lessons_completed' | 'study_days' | 'subjects_studied'
    threshold: number
  }
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ═══════════════════════════════════════════════════════════════
  // COMMON TIER - Easy to unlock, encourage beginners
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'first-step',
    name: 'Premier Pas',
    description: 'Étudier votre première carte',
    icon: 'Sparkles',
    rarity: 'common',
    category: 'cards',
    condition: { type: 'cards_studied', threshold: 1 },
  },
  {
    id: 'apprentice',
    name: 'Apprenti',
    description: 'Compléter votre première leçon',
    icon: 'GraduationCap',
    rarity: 'common',
    category: 'lessons',
    condition: { type: 'lessons_completed', threshold: 1 },
  },
  {
    id: 'streak-3',
    name: 'Bon Départ',
    description: 'Maintenir une série de 3 jours',
    icon: 'Flame',
    rarity: 'common',
    category: 'streak',
    condition: { type: 'streak_days', threshold: 3 },
  },
  {
    id: 'cards-10',
    name: 'Curieux',
    description: 'Étudier 10 cartes',
    icon: 'Eye',
    rarity: 'common',
    category: 'cards',
    condition: { type: 'cards_studied', threshold: 10 },
  },

  // ═══════════════════════════════════════════════════════════════
  // RARE TIER - Requires consistent effort
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cards-100',
    name: 'Centurion',
    description: 'Étudier 100 cartes',
    icon: 'Target',
    rarity: 'rare',
    category: 'cards',
    condition: { type: 'cards_studied', threshold: 100 },
  },
  {
    id: 'streak-7',
    name: 'Semaine Parfaite',
    description: 'Maintenir une série de 7 jours',
    icon: 'Flame',
    rarity: 'rare',
    category: 'streak',
    condition: { type: 'streak_days', threshold: 7 },
  },
  {
    id: 'xp-1000',
    name: 'Millénaire',
    description: 'Gagner 1 000 XP',
    icon: 'Zap',
    rarity: 'rare',
    category: 'xp',
    condition: { type: 'xp_earned', threshold: 1000 },
  },
  {
    id: 'lessons-5',
    name: 'Studieux',
    description: 'Compléter 5 leçons',
    icon: 'BookOpen',
    rarity: 'rare',
    category: 'lessons',
    condition: { type: 'lessons_completed', threshold: 5 },
  },
  {
    id: 'study-days-7',
    name: 'Habitué',
    description: 'Étudier 7 jours différents',
    icon: 'Calendar',
    rarity: 'rare',
    category: 'special',
    condition: { type: 'study_days', threshold: 7 },
  },

  // ═══════════════════════════════════════════════════════════════
  // EPIC TIER - Significant dedication required
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cards-500',
    name: 'Lecteur Avide',
    description: 'Étudier 500 cartes',
    icon: 'BookMarked',
    rarity: 'epic',
    category: 'cards',
    condition: { type: 'cards_studied', threshold: 500 },
  },
  {
    id: 'streak-14',
    name: 'Deux Semaines',
    description: 'Maintenir une série de 14 jours',
    icon: 'Flame',
    rarity: 'epic',
    category: 'streak',
    condition: { type: 'streak_days', threshold: 14 },
  },
  {
    id: 'xp-5000',
    name: 'Expert',
    description: 'Gagner 5 000 XP',
    icon: 'Trophy',
    rarity: 'epic',
    category: 'xp',
    condition: { type: 'xp_earned', threshold: 5000 },
  },
  {
    id: 'lessons-10',
    name: 'Érudit',
    description: 'Compléter 10 leçons',
    icon: 'Library',
    rarity: 'epic',
    category: 'lessons',
    condition: { type: 'lessons_completed', threshold: 10 },
  },
  {
    id: 'study-days-30',
    name: 'Régulier',
    description: 'Étudier 30 jours différents',
    icon: 'CalendarCheck',
    rarity: 'epic',
    category: 'special',
    condition: { type: 'study_days', threshold: 30 },
  },

  // ═══════════════════════════════════════════════════════════════
  // LEGENDARY TIER - Elite achievements
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cards-1000',
    name: 'Maître Lecteur',
    description: 'Étudier 1 000 cartes',
    icon: 'Crown',
    rarity: 'legendary',
    category: 'cards',
    condition: { type: 'cards_studied', threshold: 1000 },
  },
  {
    id: 'streak-30',
    name: 'Mois Parfait',
    description: 'Maintenir une série de 30 jours',
    icon: 'Flame',
    rarity: 'legendary',
    category: 'streak',
    condition: { type: 'streak_days', threshold: 30 },
  },
  {
    id: 'xp-10000',
    name: 'Champion',
    description: 'Gagner 10 000 XP',
    icon: 'Medal',
    rarity: 'legendary',
    category: 'xp',
    condition: { type: 'xp_earned', threshold: 10000 },
  },
  {
    id: 'lessons-25',
    name: 'Savant',
    description: 'Compléter 25 leçons',
    icon: 'GraduationCap',
    rarity: 'legendary',
    category: 'lessons',
    condition: { type: 'lessons_completed', threshold: 25 },
  },
  {
    id: 'streak-100',
    name: 'Légende',
    description: 'Maintenir une série de 100 jours',
    icon: 'Star',
    rarity: 'legendary',
    category: 'streak',
    condition: { type: 'streak_days', threshold: 100 },
  },
]

// Helper to get achievement by ID
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: AchievementDefinition['category']): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}

// Helper to get achievements by rarity
export function getAchievementsByRarity(rarity: AchievementRarity): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity)
}

import { and, eq, gte, sql } from 'drizzle-orm'
import { studySessions, userAchievements, userLessonMastery, userProfiles } from '../drizzle/schema'
import { getStreakData } from './streak'
import type { Database } from '../database/setup'

export interface UserStats {
  totalCardsStudied: number
  totalXP: number
  longestStreak: number
  currentStreak: number
  lessonsCompleted: number
  totalStudyDays: number
}

export interface AchievementWithProgress extends AchievementDefinition {
  unlocked: boolean
  unlockedAt: string | null
  progress: number
  maxProgress: number
}

/**
 * Get user stats for achievement calculation
 */
export async function getUserStatsForAchievements(
  db: Database,
  userId: string,
): Promise<UserStats> {
  // Total cards studied (from sessions)
  const cardsResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${studySessions.cardsReviewed}), 0)` })
    .from(studySessions)
    .where(eq(studySessions.userId, userId))

  // XP from profile
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { xp: true },
  })

  // Streak data
  const streakData = await getStreakData(db, userId)

  // Lessons completed (mastery >= 2)
  const lessonsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(userLessonMastery)
    .where(
      and(
        eq(userLessonMastery.userId, userId),
        gte(userLessonMastery.successfulTestCount, 2),
      ),
    )

  return {
    totalCardsStudied: Number(cardsResult[0]?.total ?? 0),
    totalXP: profile?.xp ?? 0,
    longestStreak: streakData.longestStreak,
    currentStreak: streakData.currentStreak,
    lessonsCompleted: Number(lessonsResult[0]?.count ?? 0),
    totalStudyDays: streakData.streakHistory.length,
  }
}

/**
 * Check if an achievement condition is met
 */
function isConditionMet(
  condition: AchievementDefinition['condition'],
  stats: UserStats,
): boolean {
  switch (condition.type) {
    case 'cards_studied':
      return stats.totalCardsStudied >= condition.threshold
    case 'streak_days':
      return stats.longestStreak >= condition.threshold
    case 'xp_earned':
      return stats.totalXP >= condition.threshold
    case 'lessons_completed':
      return stats.lessonsCompleted >= condition.threshold
    case 'study_days':
      return stats.totalStudyDays >= condition.threshold
    default:
      return false
  }
}

/**
 * Get current progress toward an achievement
 */
function getProgress(
  condition: AchievementDefinition['condition'],
  stats: UserStats,
): number {
  switch (condition.type) {
    case 'cards_studied':
      return Math.min(stats.totalCardsStudied, condition.threshold)
    case 'streak_days':
      return Math.min(stats.longestStreak, condition.threshold)
    case 'xp_earned':
      return Math.min(stats.totalXP, condition.threshold)
    case 'lessons_completed':
      return Math.min(stats.lessonsCompleted, condition.threshold)
    case 'study_days':
      return Math.min(stats.totalStudyDays, condition.threshold)
    default:
      return 0
  }
}

/**
 * Get all achievements with unlock status and progress for a user
 */
export async function getUserAchievements(
  db: Database,
  userId: string,
): Promise<{
  achievements: AchievementWithProgress[]
  newlyUnlocked: AchievementWithProgress[]
  stats: UserStats
}> {
  // Get user stats
  const stats = await getUserStatsForAchievements(db, userId)

  // Get previously unlocked achievements
  const unlockedRecords = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId))

  const unlockedMap = new Map(
    unlockedRecords.map(r => [r.achievementId, { unlockedAt: r.unlockedAt, notified: r.notified }])
  )

  // Calculate achievement status
  const achievements: AchievementWithProgress[] = []
  const newlyUnlocked: AchievementWithProgress[] = []

  for (const def of ACHIEVEMENTS) {
    const wasUnlocked = unlockedMap.has(def.id)
    const isNowUnlocked = isConditionMet(def.condition, stats)
    const progress = getProgress(def.condition, stats)

    const achievement: AchievementWithProgress = {
      ...def,
      unlocked: isNowUnlocked,
      unlockedAt: unlockedMap.get(def.id)?.unlockedAt ?? null,
      progress,
      maxProgress: def.condition.threshold,
    }

    achievements.push(achievement)

    // Track for notification: 
    // - Newly unlocked in this request
    // - OR unlocked previously but never notified
    const isNotified = unlockedMap.get(def.id)?.notified ?? false
    if (isNowUnlocked && (!wasUnlocked || !isNotified)) {
      newlyUnlocked.push(achievement)
    }
  }

  // Persist newly unlocked achievements
  if (newlyUnlocked.length > 0) {
    const now = new Date().toISOString()
    await db.insert(userAchievements).values(
      newlyUnlocked.map(a => ({
        userId,
        achievementId: a.id,
        unlockedAt: now,
        notified: false,
      }))
    ).onConflictDoNothing()
  }

  return { achievements, newlyUnlocked, stats }
}

/**
 * Mark achievements as notified (after showing unlock animation)
 */
export async function markAchievementsNotified(
  db: Database,
  userId: string,
  achievementIds: string[],
): Promise<void> {
  if (achievementIds.length === 0) return

  await db
    .update(userAchievements)
    .set({ notified: true, notifiedAt: new Date().toISOString() })
    .where(
      and(
        eq(userAchievements.userId, userId),
        sql`${userAchievements.achievementId} = ANY(${achievementIds})`,
      ),
    )
}
