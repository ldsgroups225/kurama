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
      <div className="min-h-screen bg-background pb-24 text-foreground">
        <AppHeader title="Informations Personnelles" showAvatar={false} className="bg-transparent/0 border-none relative z-20" />
        <main className="mx-auto max-w-lg px-4 py-6 relative z-10">
          <FormSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground selection:bg-indigo-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[80%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <AppHeader title="Informations Personnelles" showAvatar={false} className="bg-transparent/0 border-none relative z-20" />

      <main className="mx-auto max-w-lg px-4 py-6 relative z-10">
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
