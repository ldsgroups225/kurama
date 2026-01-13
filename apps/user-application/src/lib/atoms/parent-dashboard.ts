import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

/**
 * Parent Dashboard State Atoms
 *
 * These atoms manage the state specific to the parent dashboard,
 * including the currently selected child and alerts.
 */

// Currently selected child ID - persisted in localStorage
export const currentChildIdAtom = atomWithStorage<string | null>(
  'kurama-current-child-id',
  null,
)

// Unread alerts count (derived from alerts, but stored for quick access)
export const unreadAlertsCountAtom = atom<number>(0)

// Types for parent dashboard
export interface LinkedChild {
  id: string
  firstName: string
  lastName: string
  image?: string
  gradeName?: string
  status: 'active' | 'pending' | 'revoked'
}

export interface ChildStats {
  lastActiveAt: Date | null
  activityStatus: 'active' | 'warning' | 'inactive'
  weeklyStudyMinutes: number
  weeklyGoalMinutes: number
  currentStreak: number
  longestStreak: number
  totalSessions: number
  totalCards: number
  successRate: number
}

export interface ParentAlert {
  id: string
  type: 'warning' | 'success' | 'info'
  title: string
  description: string
  createdAt: Date
  read: boolean
  childId: string
}

export interface SubjectPerformance {
  subjectId: string
  subjectName: string
  subjectColor: string
  successRate: number
  trend: 'up' | 'down' | 'stable'
  studyMinutes: number
}
