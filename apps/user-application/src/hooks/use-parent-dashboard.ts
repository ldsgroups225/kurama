import { useQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { getChildStats, getLinkedChildren, getParentAlerts } from '@/core/functions/parent'
import { currentChildIdAtom } from '@/lib/atoms/parent-dashboard'

/**
 * Hook for parent dashboard data
 * Provides access to children, stats, and alerts
 */
export function useParentDashboard() {
  const [currentChildId, setCurrentChildId] = useAtom(currentChildIdAtom)

  // Get all linked children
  const { data: children = [], isLoading: isLoadingChildren } = useQuery({
    queryKey: ['linked-children'],
    queryFn: () => getLinkedChildren(),
  })

  // Get currently selected child (or first child if none selected)
  const selectedChild = useMemo(() => {
    if (!currentChildId)
      return children[0] ?? null
    return children.find(c => c.id === currentChildId) ?? children[0] ?? null
  }, [currentChildId, children])

  // Get stats for selected child
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['child-stats', selectedChild?.id],
    queryFn: () => getChildStats({ data: selectedChild!.id }),
    enabled: !!selectedChild?.id,
  })

  // Get all alerts
  const { data: allAlerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['parent-alerts'],
    queryFn: () => getParentAlerts(),
  })

  // Get alerts filtered by selected child
  const alerts = useMemo(() => {
    if (!selectedChild)
      return allAlerts
    return allAlerts.filter(a => a.childId === selectedChild.id)
  }, [selectedChild, allAlerts])

  // Get unread alerts count
  const unreadAlertsCount = useMemo(() => {
    return allAlerts.filter(a => !a.read).length
  }, [allAlerts])

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
    childStats: statsData ?? null,
    subjectPerformance: statsData?.subjectPerformance ?? [],

    // Alerts
    alerts,
    unreadAlertsCount,

    // Loading states
    isLoading: isLoadingChildren || isLoadingStats || isLoadingAlerts,
    isError: false,
  }
}

/**
 * Hook for managing alerts
 */
export function useParentAlerts() {
  const { data: alerts = [], refetch } = useQuery({
    queryKey: ['parent-alerts'],
    queryFn: () => getParentAlerts(),
  })

  const unreadCount = alerts.filter(a => !a.read).length

  const markAsRead = useCallback((_alertId: string) => {
    // TODO: For now, since no backend table exists, we mock the effect
    // In production, this would call a mutation
    console.warn('Mark alert as read:', _alertId)
  }, [])

  const markAllAsRead = useCallback(() => {
    console.warn('Mark all alerts as read')
  }, [])

  return {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  }
}
