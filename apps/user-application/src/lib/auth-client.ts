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
 */
export async function signOut() {
  try {
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
