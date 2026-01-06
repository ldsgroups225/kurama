import { createFileRoute, redirect } from '@tanstack/react-router'
import { FormSkeleton } from '@/components/skeletons/form-skeleton'
import { getProfileStatus } from '@/core/functions/profile'
import { isSigningOut } from '@/lib/auth-client'
import { hasCachedAuthenticatedSession } from '@/lib/auth-session-cache'

export const Route = createFileRoute('/onboarding')({
  pendingComponent: FormSkeleton,
  beforeLoad: async () => {
    try {
      if (isSigningOut()) {
        return
      }

      // Avoid hitting protected endpoints when we already know we are not authenticated
      if (!hasCachedAuthenticatedSession()) {
        return
      }

      // Check if profile is already completed (this also checks auth)
      const profileStatus = await getProfileStatus()
      if (profileStatus.isCompleted) {
        // Profile already completed, redirect to app
        throw redirect({ to: '/app' })
      }
    }
    catch (error) {
      // If error is a redirect, re-throw it
      if (typeof error === 'object' && error !== null && 'to' in error) {
        throw error
      }

      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw error
      }
      // User not authenticated or other error - let them continue to onboarding
      // The onboarding page will handle showing auth if needed
    }
  },
})
