import type { QueryClient } from '@tanstack/react-query'
import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { clearUserAuthData } from './auth-storage'

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
})

export const { useSession } = authClient

/**
 * Enhanced sign out that clears user-specific auth state
 * Preserves app-level cache and preferences
 *
 * @param queryClient - Optional TanStack Query client to clear user-specific queries
 */
export async function signOut(queryClient?: QueryClient) {
  try {
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
