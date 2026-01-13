import type { ChildStats, LinkedChild, ParentAlert, SubjectPerformance } from '@/lib/atoms/parent-dashboard'
import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { currentChildIdAtom } from '@/lib/atoms/parent-dashboard'

/**
 * Mock data for parent dashboard
 * Will be replaced with real API calls in production
 */

// Mock linked children
const MOCK_CHILDREN: LinkedChild[] = [
  {
    id: 'child-1',
    firstName: 'Abdoulaye',
    lastName: 'Koné',
    image: undefined,
    gradeName: 'Terminale D',
    status: 'active',
  },
  {
    id: 'child-2',
    firstName: 'Fatou',
    lastName: 'Koné',
    image: undefined,
    gradeName: '3ème',
    status: 'active',
  },
]

// Mock stats per child
const MOCK_CHILD_STATS: Record<string, ChildStats> = {
  'child-1': {
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    activityStatus: 'active',
    weeklyStudyMinutes: 750, // 12h 30min
    weeklyGoalMinutes: 900, // 15h
    currentStreak: 8,
    longestStreak: 12,
    totalSessions: 156,
    totalCards: 1247,
    successRate: 74,
  },
  'child-2': {
    lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    activityStatus: 'warning',
    weeklyStudyMinutes: 180, // 3h
    weeklyGoalMinutes: 600, // 10h
    currentStreak: 0,
    longestStreak: 5,
    totalSessions: 42,
    totalCards: 328,
    successRate: 61,
  },
}

// Mock subject performance per child
const MOCK_SUBJECT_PERFORMANCE: Record<string, SubjectPerformance[]> = {
  'child-1': [
    { subjectId: '1', subjectName: 'Mathématiques', subjectColor: 'xp', successRate: 78, trend: 'up', studyMinutes: 180 },
    { subjectId: '2', subjectName: 'Physique-Chimie', subjectColor: 'epic', successRate: 65, trend: 'stable', studyMinutes: 120 },
    { subjectId: '3', subjectName: 'Français', subjectColor: 'error', successRate: 52, trend: 'down', studyMinutes: 90 },
    { subjectId: '4', subjectName: 'SVT', subjectColor: 'success', successRate: 71, trend: 'up', studyMinutes: 150 },
    { subjectId: '5', subjectName: 'Anglais', subjectColor: 'rare', successRate: 85, trend: 'up', studyMinutes: 120 },
    { subjectId: '6', subjectName: 'Histoire-Géo', subjectColor: 'level', successRate: 68, trend: 'stable', studyMinutes: 90 },
  ],
  'child-2': [
    { subjectId: '1', subjectName: 'Mathématiques', subjectColor: 'xp', successRate: 58, trend: 'down', studyMinutes: 60 },
    { subjectId: '2', subjectName: 'Français', subjectColor: 'error', successRate: 72, trend: 'up', studyMinutes: 45 },
    { subjectId: '3', subjectName: 'SVT', subjectColor: 'success', successRate: 55, trend: 'stable', studyMinutes: 30 },
    { subjectId: '4', subjectName: 'Anglais', subjectColor: 'rare', successRate: 61, trend: 'stable', studyMinutes: 45 },
  ],
}

// Mock alerts
const MOCK_ALERTS: ParentAlert[] = [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'Baisse de performance',
    description: 'Français en baisse de 15% depuis 2 semaines',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    childId: 'child-1',
  },
  {
    id: 'alert-2',
    type: 'success',
    title: 'Objectif atteint !',
    description: 'Abdoulaye a atteint son objectif hebdomadaire',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    childId: 'child-1',
  },
  {
    id: 'alert-3',
    type: 'warning',
    title: 'Inactivité prolongée',
    description: 'Fatou n\'a pas étudié depuis 3 jours',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    read: false,
    childId: 'child-2',
  },
  {
    id: 'alert-4',
    type: 'info',
    title: 'Nouvelle simulation',
    description: 'Examen blanc de Mathématiques disponible',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    childId: 'child-1',
  },
]

/**
 * Hook for parent dashboard data
 * Provides access to children, stats, and alerts
 */
export function useParentDashboard() {
  const [currentChildId, setCurrentChildId] = useAtom(currentChildIdAtom)

  // Get all linked children
  const children = MOCK_CHILDREN

  // Get currently selected child (or first child if none selected)
  const selectedChild = useMemo(() => {
    if (!currentChildId)
      return children[0] ?? null
    return children.find(c => c.id === currentChildId) ?? children[0] ?? null
  }, [currentChildId, children])

  // Get stats for selected child
  const childStats = useMemo(() => {
    if (!selectedChild)
      return null
    return MOCK_CHILD_STATS[selectedChild.id] ?? null
  }, [selectedChild])

  // Get subject performance for selected child
  const subjectPerformance = useMemo(() => {
    if (!selectedChild)
      return []
    return MOCK_SUBJECT_PERFORMANCE[selectedChild.id] ?? []
  }, [selectedChild])

  // Get all alerts (filtered by selected child)
  const alerts = useMemo(() => {
    if (!selectedChild)
      return MOCK_ALERTS
    return MOCK_ALERTS.filter(a => a.childId === selectedChild.id)
  }, [selectedChild])

  // Get unread alerts count
  const unreadAlertsCount = useMemo(() => {
    return MOCK_ALERTS.filter(a => !a.read).length
  }, [])

  // Select a child
  const selectChild = useCallback((childId: string) => {
    setCurrentChildId(childId)
  }, [setCurrentChildId])

  return {
    // Children
    children,
    selectedChild,
    selectChild,

    // Stats
    childStats,
    subjectPerformance,

    // Alerts
    alerts,
    unreadAlertsCount,

    // Loading states (for future API integration)
    isLoading: false,
    isError: false,
  }
}

/**
 * Hook for managing alerts
 */
export function useParentAlerts() {
  // In production, this would use a query/mutation
  const alerts = MOCK_ALERTS
  const unreadCount = alerts.filter(a => !a.read).length

  const markAsRead = useCallback((_alertId: string) => {
    // In production, this would call an API
    console.log('Mark alert as read:', _alertId)
  }, [])

  const markAllAsRead = useCallback(() => {
    // In production, this would call an API
    console.log('Mark all alerts as read')
  }, [])

  return {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}
