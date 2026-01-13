import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppPageSkeleton } from '@/components/skeletons'
import { getStoredUserProfile } from '@/lib/atoms'

export const Route = createFileRoute('/_auth/app/')({
  pendingComponent: AppPageSkeleton,
  beforeLoad: () => {
    // Check if user is a parent and redirect to parent dashboard
    const userProfile = getStoredUserProfile()
    if (userProfile?.userType === 'parent') {
      throw redirect({ to: '/app/parent' })
    }
  },
})
