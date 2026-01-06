import type { QueryClient } from '@tanstack/react-query'
import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { clearCachedSessionState, setCachedSessionState } from './auth-session-cache'
import { clearUserAuthData } from './auth-storage'

let signingOut = false
let lastSignOutTime = 0

export function isSigningOut(): boolean {
  // Return true if currently signing out OR within a 2-second grace period after completion
  // This prevents race conditions where components re-mount/re-render during navigation
  return signingOut || (Date.now() - lastSignOutTime < 2000)
}

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
})

export const { useSession } = authClient

/**
 * Sync session state to cache whenever it changes
 * Call this in components that use session to keep cache updated
 */
export function syncSessionCache(session: { data: { user?: { id: string } } | null }): void {
  // Don't sync during sign out process
  if (isSigningOut()) {
    return
  }

  if (session.data?.user) {
    setCachedSessionState(true, session.data.user.id)
  }
  else if (session.data === null) {
    // Only clear when we're certain there's no session (not during loading)
    clearCachedSessionState()
  }
}

/**
 * Sign out that clears user-specific auth state
 * Preserves app-level cache and preferences
 *
 * @param queryClient - Optional TanStack Query client to clear user-specific queries
 */
export async function signOut(queryClient?: QueryClient) {
  signingOut = true

  try {
    // First, cancel and remove user-specific queries to prevent any in-flight requests
    if (queryClient) {
      const userQueryKeys: Array<readonly unknown[]> = [
        ['profile-status'],
        ['user-profile'],
        ['subscription'],
        ['subscription-tier'],
        ['customer-portal-url'],
        ['dashboard-stats'],
        ['daily-challenge-status'],
        ['review-cards-count'],
      ]

      await Promise.all(
        userQueryKeys.map(queryKey => queryClient.cancelQueries({ queryKey })),
      )

      userQueryKeys.forEach((queryKey) => {
        queryClient.removeQueries({ queryKey })
      })
    }

    // Clear session cache immediately for instant UI feedback
    clearCachedSessionState()

    // Clear user-specific auth data from IndexedDB and reset atoms
    // This should happen regardless of server errors
    await clearUserAuthData()

    // Call Better Auth sign out - but don't let server errors prevent logout
    try {
      await authClient.signOut()
    }
    catch {
      // Continue with logout even if server fails
    }
  }
  catch (error) {
    console.error('[Auth] Error during sign out:', error)
    // Still attempt to clear local data even if other parts fail
    try {
      await clearUserAuthData()
    }
    catch (cleanupError) {
      console.error('[Auth] Failed to cleanup auth data:', cleanupError)
    }
    throw error
  }
  finally {
    signingOut = false
    lastSignOutTime = Date.now()
  }
}
