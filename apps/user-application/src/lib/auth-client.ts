import type { QueryClient } from '@tanstack/react-query'
import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { clearCachedSessionState, setCachedSessionState } from './auth-session-cache'
import { clearUserAuthData } from './auth-storage'

let signingOut = false
let lastSignOutTime = 0

export function isSigningOut(): boolean {
  // Return true if currently signing out OR within a 500ms grace period after completion
  // This prevents race conditions where components re-mount/re-render during navigation
  return signingOut || (Date.now() - lastSignOutTime < 500)
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
  // Skip all synchronization during sign-out process (including grace period)
  // This prevents race conditions where components re-mount during navigation
  if (isSigningOut()) {
    return
  }

  if (session.data?.user) {
    setCachedSessionState(true, session.data.user.id)
  }
  else if (session.data === null) {
    // Clear when we're certain there's no session
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
    // First, cancel and remove all queries to prevent any in-flight requests and data leakage
    if (queryClient) {
      await queryClient.cancelQueries()
      queryClient.clear()
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
