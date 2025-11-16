import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { clearAllAuthStates } from './auth-storage'

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
})

export const { useSession, signIn } = authClient

/**
 * Enhanced sign out that also clears encrypted auth state from IndexedDB
 */
export async function signOut() {
  try {
    // Clear encrypted auth state from IndexedDB
    await clearAllAuthStates()

    // Call Better Auth sign out
    await authClient.signOut()

    console.warn('Successfully signed out and cleared auth state')
  }
  catch (error) {
    console.error('Error during sign out:', error)
    // Still attempt Better Auth sign out even if clearing state fails
    await authClient.signOut()
  }
}
