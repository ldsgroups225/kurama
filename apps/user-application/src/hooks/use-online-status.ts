import { useEffect, useState, useSyncExternalStore } from 'react'
import { db } from '@/lib/db'

/**
 * Online status information
 */
export interface OnlineStatus {
  /** Whether the device is currently online */
  isOnline: boolean
  /** Timestamp of when the device went offline (null if online) */
  lastOnline: number | null
  /** Duration in milliseconds that the device has been offline (0 if online) */
  offlineDuration: number
  /** Whether the connectivity check is in progress */
  isChecking: boolean
}

/**
 * Subscribe to browser online/offline events
 * This function is stable and won't cause re-subscriptions
 */
function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)

  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/**
 * Get the current online status from navigator.onLine
 * This is the client-side snapshot function
 */
function getSnapshot(): boolean {
  return navigator.onLine
}

/**
 * Get the server-side snapshot (always true during SSR)
 * This prevents hydration mismatches
 */
function getServerSnapshot(): boolean {
  return true
}

/**
 * Perform a connectivity check by making a HEAD request to the health endpoint
 * This validates actual network connectivity beyond just navigator.onLine
 */
async function checkConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  }
  catch {
    return false
  }
}

/**
 * Custom hook for tracking online/offline status with enhanced connectivity checks
 *
 * Features:
 * - Uses useSyncExternalStore for robust subscription to browser events
 * - Periodic connectivity checks to validate actual network access
 * - Tracks offline duration and last online timestamp
 * - Persists last online time to IndexedDB for cross-session tracking
 * - SSR-safe with proper server snapshot handling
 *
 * @returns OnlineStatus object with current connectivity information
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline, offlineDuration, lastOnline } = useOnlineStatus()
 *
 *   return (
 *     <div>
 *       {isOnline ? (
 *         <span>✅ Online</span>
 *       ) : (
 *         <span>❌ Offline for {Math.floor(offlineDuration / 1000)}s</span>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useOnlineStatus(): OnlineStatus {
  // Subscribe to browser online/offline events using useSyncExternalStore
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Track last online timestamp
  const [lastOnline, setLastOnline] = useState<number | null>(null)

  // Track offline duration
  const [offlineDuration, setOfflineDuration] = useState(0)

  // Track connectivity check status
  const [isChecking, setIsChecking] = useState(false)

  // Update last online timestamp when status changes
  useEffect(() => {
    const updateLastOnline = async () => {
      const now = Date.now()

      if (isOnline) {
        // Device is online, clear last online timestamp
        setLastOnline(null)
        setOfflineDuration(0)

        // Store current time as last online in IndexedDB
        await db.appState.put({
          key: 'lastOnlineTimestamp',
          value: now,
        })
      }
      else {
        // Device is offline, retrieve last online time from IndexedDB
        const storedState = await db.appState.get('lastOnlineTimestamp')
        const lastOnlineTime = (storedState?.value as number) || now

        setLastOnline(lastOnlineTime)
      }
    }

    updateLastOnline()
  }, [isOnline])

  // Calculate offline duration periodically when offline
  useEffect(() => {
    if (!isOnline && lastOnline) {
      const interval = setInterval(() => {
        setOfflineDuration(Date.now() - lastOnline)
      }, 1000) // Update every second

      return () => clearInterval(interval)
    }
  }, [isOnline, lastOnline])

  // Perform periodic connectivity checks when online
  useEffect(() => {
    if (!isOnline)
      return

    const performCheck = async () => {
      setIsChecking(true)
      const actuallyOnline = await checkConnectivity()
      setIsChecking(false)

      // If check fails but navigator.onLine says we're online,
      // the browser will eventually fire an offline event
      // We don't manually update state here to avoid conflicts
      if (!actuallyOnline) {
        console.warn('Connectivity check failed despite navigator.onLine being true')
      }
    }

    // Initial check
    performCheck()

    // Periodic checks every 30 seconds
    const interval = setInterval(performCheck, 30000)

    return () => clearInterval(interval)
  }, [isOnline])

  return {
    isOnline,
    lastOnline,
    offlineDuration,
    isChecking,
  }
}
