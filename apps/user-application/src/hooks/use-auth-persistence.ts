import { useEffect, useRef } from 'react'
import { authClient } from '@/lib/auth-client'
import {
  clearAllAuthStates,
  clearAuthState,
  getAuthState,
  isTokenExpiringSoon,
  storeAuthState,
} from '@/lib/auth-storage'

/**
 * Hook to manage authentication token persistence with Better Auth
 * Automatically stores tokens in encrypted IndexedDB and handles token refresh
 */
export function useAuthPersistence() {
  const session = authClient.useSession()
  const hasStoredToken = useRef(false)
  const refreshTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Store token when user authenticates
  useEffect(() => {
    const storeToken = async () => {
      if (!session.data?.session || !session.data?.user) {
        return
      }

      const { session: sessionData, user } = session.data

      // Avoid storing multiple times
      if (hasStoredToken.current) {
        return
      }

      try {
        // Calculate expiry time (Better Auth sessions typically have expiresAt)
        const expiryTime = sessionData.expiresAt
          ? new Date(sessionData.expiresAt).getTime()
          : Date.now() + 7 * 24 * 60 * 60 * 1000 // Default 7 days

        // Store the session token with user metadata
        await storeAuthState(user.id, sessionData.token, expiryTime, {
          userId: user.id,
          email: user.email,
          name: user.name,
        })

        hasStoredToken.current = true
        console.warn('Auth token stored successfully')
      }
      catch (error) {
        console.error('Failed to store auth token:', error)
      }
    }

    storeToken()
  }, [session.data])

  // Set up token refresh timer
  useEffect(() => {
    const setupRefreshTimer = async () => {
      if (!session.data?.user) {
        return
      }

      try {
        const authState = await getAuthState(session.data.user.id)

        if (!authState) {
          return
        }

        // Check if token is expiring soon (within 5 minutes)
        if (isTokenExpiringSoon(authState.expiryTime)) {
          console.warn('Token expiring soon, triggering refresh...')
          // Better Auth handles token refresh automatically through session checks
          // Trigger a session check by calling getSession
          await authClient.getSession()
        }
        else {
          // Set up timer to check again before expiry
          const timeUntilExpiry = authState.expiryTime - Date.now()
          const checkInterval = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000) // Check 5 min before expiry or in 1 min

          refreshTimerRef.current = setTimeout(() => {
            setupRefreshTimer()
          }, checkInterval)
        }
      }
      catch (error) {
        console.error('Failed to setup refresh timer:', error)
      }
    }

    setupRefreshTimer()

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [session.data])

  // Clear token on logout
  useEffect(() => {
    const handleLogout = async () => {
      if (!session.data && hasStoredToken.current) {
        try {
          // Clear all auth states on logout
          await clearAllAuthStates()
          hasStoredToken.current = false
          console.warn('Auth token cleared on logout')
        }
        catch (error) {
          console.error('Failed to clear auth token:', error)
        }
      }
    }

    handleLogout()
  }, [session.data])

  return {
    isAuthenticated: !!session.data,
    session: session.data,
    isLoading: session.isPending,
  }
}

/**
 * Restore session from IndexedDB on app startup
 * Call this once when the app initializes
 */
export async function restoreAuthSession(userId: string): Promise<boolean> {
  try {
    const authState = await getAuthState(userId)

    if (!authState) {
      return false
    }

    // Token is still valid
    console.warn('Restored auth session from IndexedDB')
    return true
  }
  catch (error) {
    console.error('Failed to restore auth session:', error)
    return false
  }
}

/**
 * Validate cached token on app startup
 * Returns true if token is valid and not expired
 */
export async function validateCachedToken(userId: string): Promise<boolean> {
  try {
    const authState = await getAuthState(userId)

    if (!authState) {
      return false
    }

    // Check if token is expired
    if (Date.now() >= authState.expiryTime) {
      await clearAuthState(userId)
      return false
    }

    return true
  }
  catch (error) {
    console.error('Failed to validate cached token:', error)
    return false
  }
}
