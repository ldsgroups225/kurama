import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AppHeader, BottomNav } from '@/components/main'
import { ProfileEditForm } from '@/components/profile'
import { FormSkeleton } from '@/components/skeletons/form-skeleton'
import { getUserProfile } from '@/core/functions/profile'
import { trackRouteLoad } from '@/lib/performance-monitor'

export const Route = createFileRoute('/_auth/app/profile/edit')({
  component: ProfileEditPage,
})

function ProfileEditPage() {
  const navigate = useNavigate()

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('profile-edit')
    return endTracking
  }, [])

  // Fetch user's current profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => getUserProfile(),
  })

  const handleBack = () => {
    navigate({ to: '/app/profile' })
  }

  const handleSuccess = () => {
    navigate({ to: '/app/profile' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <AppHeader title="Informations Personnelles" showAvatar={false} />
        <main className="mx-auto max-w-lg px-4 py-6">
          <FormSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Informations Personnelles" showAvatar={false} />

      <main className="mx-auto max-w-lg px-4 py-6">
        <ProfileEditForm
          profile={profile}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      </main>

      <BottomNav />
    </div>
  )
}
