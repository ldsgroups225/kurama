import { createFileRoute, redirect } from '@tanstack/react-router'
import { PageSkeleton } from '@/components/skeletons/page-skeleton'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
  pendingComponent: PageSkeleton,
  beforeLoad: async () => {
    // Check session before rendering to prevent flash
    if (typeof window !== 'undefined') {
      try {
        const session = await authClient.getSession()
        if (session.data) {
          throw redirect({ to: '/app' })
        }
      }
      catch (error) {
        // If redirect error, rethrow it
        if (error && typeof error === 'object' && 'to' in error) {
          throw error
        }
        // Otherwise, continue to landing page
      }
    }
  },
})
