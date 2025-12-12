import type { QueryClient } from '@tanstack/react-query'
import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { clearCachedSessionState, setCachedSessionState } from './auth-session-cache'
import { clearUserAuthData } from './auth-storage'

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
})

export const { useSession } = authClient

/**
 * Sync session state to cache whenever it changes
 * Call this in components that use session to keep cache updated
 */
export function syncSessionCache(session: { data: { user?: { id: string } } | null }): void {
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
  try {
    // Clear session cache immediately for instant UI feedback
    clearCachedSessionState()

    // Clear user-specific query cache if queryClient provided
    if (queryClient) {
      queryClient.removeQueries({ queryKey: ['profile-status'] })
      queryClient.removeQueries({ queryKey: ['user-profile'] })
      queryClient.removeQueries({ queryKey: ['subscription'] })
    }

    // Clear user-specific auth data from IndexedDB and reset atoms
    await clearUserAuthData()

    // Call Better Auth sign out
    await authClient.signOut()
  }
  catch (error) {
    console.error('Error during sign out:', error)
    // Still attempt Better Auth sign out even if clearing state fails
    await authClient.signOut()
  }
}
