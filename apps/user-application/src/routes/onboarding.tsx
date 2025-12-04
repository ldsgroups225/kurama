import { createFileRoute, redirect } from '@tanstack/react-router'
import { FormSkeleton } from '@/components/skeletons/form-skeleton'
import { getProfileStatus } from '@/core/functions/profile'

export const Route = createFileRoute('/onboarding')({
  pendingComponent: FormSkeleton,
  beforeLoad: async () => {
    try {
      // Check if profile is already completed (this also checks auth)
      const profileStatus = await getProfileStatus()
      if (profileStatus.isCompleted) {
        // Profile already completed, redirect to app
        throw redirect({ to: '/app' })
      }
    }
    catch (error) {
      // If error is a redirect, re-throw it
      if (error instanceof Response || (typeof error === 'object' && error !== null && 'to' in error)) {
        throw error
      }
      // User not authenticated or other error - let them continue to onboarding
      // The onboarding page will handle showing auth if needed
    }
  },
})
