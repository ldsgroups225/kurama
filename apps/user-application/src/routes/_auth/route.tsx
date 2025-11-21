import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { GoogleLogin } from '@/components/auth/google-login'
import {
  ConflictResolutionDialog,
  InstallPrompt,
  OfflineBanner,
  UpdatePrompt,
} from '@/components/pwa'
import { getProfileStatus, getUserProfile } from '@/core/functions/profile'
import { useAuthPersistence } from '@/hooks'
import { userProfileAtom } from '@/lib/atoms'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = authClient.useSession()
  const setUserProfile = useSetAtom(userProfileAtom)
  const queryClient = useQueryClient()
  const previousUserIdRef = useRef<string | null>(null)

  // Enable auth token persistence
  useAuthPersistence()

  // Invalidate queries when user changes (sign in/out or different user)
  useEffect(() => {
    const currentUserId = session.data?.user?.id ?? null
    const previousUserId = previousUserIdRef.current

    // If user changed (different user or signed out)
    if (previousUserId !== currentUserId) {
      // Clear user-specific queries for ALL users (not just previous)
      // This ensures no stale data from any previous session
      queryClient.removeQueries({ queryKey: ['profile-status'] })
      queryClient.removeQueries({ queryKey: ['user-profile'] })
      queryClient.removeQueries({ queryKey: ['subscription'] })

      // Clear user profile atom
      setUserProfile(null)
    }

    previousUserIdRef.current = currentUserId
  }, [session.data?.user?.id, queryClient, setUserProfile])

  // Check profile completion status when user is authenticated
  const { data: profileStatus, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile-status', session.data?.user?.id],
    queryFn: () => getProfileStatus(),
    enabled: !!session.data, // Only run when user is authenticated
  })

  // Fetch and cache user profile if completed
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', session.data?.user?.id],
    queryFn: () => getUserProfile(),
    enabled: !!session.data && profileStatus?.isCompleted === true,
  })

  // Cache profile data in localStorage when fetched
  // Only update if we have both profile and matching session
  useEffect(() => {
    if (userProfile && session.data?.user && userProfile.userId === session.data.user.id) {
      setUserProfile({
        userType: userProfile.userType,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: session.data.user.email ?? undefined,
        image: session.data.user.image ?? undefined,
        name: session.data.user.name ?? undefined,
        phone: userProfile.phone ?? undefined,
        age: userProfile.age ?? undefined,
        gender: userProfile.gender ?? undefined,
        city: userProfile.city ?? undefined,
        idNumber: userProfile.idNumber ?? undefined,
        gradeName: userProfile.grade?.name ?? undefined,
        seriesName: userProfile.series?.name ?? undefined,
        favoriteSubjects: userProfile.favoriteSubjects as string[] | undefined,
        learningGoals: userProfile.learningGoals ?? undefined,
        studyTime: userProfile.studyTime ?? undefined,
        childrenMatricules: userProfile.childrenMatricules as number[] | undefined,
      })
    }
  }, [userProfile, session.data, setUserProfile])

  // Show loading spinner while checking auth or profile
  if (session.isPending || (session.data && isLoadingProfile)) {
    return (
      <div className={`
        flex min-h-screen items-center justify-center bg-background
      `}
      >
        <div className={`
          h-8 w-8 animate-spin rounded-full border-b-2 border-primary
        `}
        >
        </div>
      </div>
    )
  }

  // Not authenticated - show login
  if (!session.data) {
    return <GoogleLogin />
  }

  // Authenticated but profile not completed - redirect to onboarding
  if (profileStatus && !profileStatus.isCompleted) {
    return <Navigate to="/onboarding" />
  }

  // Authenticated and profile completed - show app
  return (
    <>
      {/* PWA Components */}
      <OfflineBanner />
      <InstallPrompt />
      <UpdatePrompt />
      <ConflictResolutionDialog />

      {/* Main App Content */}
      <Outlet />
    </>
  )
}
