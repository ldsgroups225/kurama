import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
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
import { authClient, syncSessionCache } from '@/lib/auth-client'
import { hasCachedAuthenticatedSession } from '@/lib/auth-session-cache'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = authClient.useSession()
  const setUserProfile = useSetAtom(userProfileAtom)
  const queryClient = useQueryClient()
  const previousUserIdRef = useRef<string | null>(null)

  // Check if we have a cached authenticated session for instant UI decisions
  const [hasCachedSession] = useState(() => hasCachedAuthenticatedSession())

  // Sync session state to cache whenever it changes
  useEffect(() => {
    if (!session.isPending) {
      syncSessionCache(session)
    }
  }, [session.isPending, session.data])

  // Enable auth token persistence
  useAuthPersistence()

  // Invalidate queries when user changes (different user or signed out)
  // Important: Only clear when switching FROM one user TO another or signing out
  // Don't clear on initial load (null → userId) as this causes flash
  useEffect(() => {
    const currentUserId = session.data?.user?.id ?? null
    const previousUserId = previousUserIdRef.current

    // Only clear queries if:
    // 1. We had a previous user (not initial load)
    // 2. AND the user changed (different user or signed out)
    const hadPreviousUser = previousUserId !== null
    const userChanged = previousUserId !== currentUserId

    if (hadPreviousUser && userChanged) {
      // Clear user-specific queries when switching users or signing out
      queryClient.removeQueries({ queryKey: ['profile-status'] })
      queryClient.removeQueries({ queryKey: ['user-profile'] })
      queryClient.removeQueries({ queryKey: ['subscription'] })

      // Clear user profile atom
      setUserProfile(null)
    }

    previousUserIdRef.current = currentUserId
  }, [session.data?.user?.id, queryClient, setUserProfile])

  // Check profile completion status when user is authenticated
  const { data: profileStatus, isLoading: isLoadingProfile, isFetched: isProfileStatusFetched } = useQuery({
    queryKey: ['profile-status', session.data?.user?.id],
    queryFn: () => getProfileStatus(),
    enabled: !!session.data, // Only run when user is authenticated
  })

  // Fetch and cache user profile if completed
  const { data: userProfile, isLoading: isLoadingUserProfile } = useQuery({
    queryKey: ['user-profile', session.data?.user?.id],
    queryFn: () => getUserProfile(),
    enabled: !!session.data && profileStatus?.isCompleted === true,
  })

  // Cache profile data in localStorage when fetched
  // Only update if we have both profile and matching session
  useEffect(() => {
    const profile = userProfile
    if (profile && session.data?.user && profile.userId === session.data.user.id) {
      setUserProfile({
        userType: profile.userType,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: session.data.user.email ?? undefined,
        image: session.data.user.image ?? undefined,
        name: session.data.user.name ?? undefined,
        phone: profile.phone ?? undefined,
        age: profile.age ?? undefined,
        gender: profile.gender ?? undefined,
        city: profile.city ?? undefined,
        idNumber: profile.idNumber ?? undefined,
        gradeName: profile.grade?.name ?? undefined,
        seriesName: profile.series?.name ?? undefined,
        favoriteSubjects: profile.favoriteSubjects ?? undefined,
        learningGoals: profile.learningGoals ?? undefined,
        studyTime: profile.studyTime ?? undefined,
        childrenMatricules: profile.childrenMatricules ?? undefined,
      })
    }
  }, [userProfile, session.data, setUserProfile])

  // Determine if we should show loading state
  // Key principle: Keep loading until ALL background verifications are complete
  // This prevents the flash: loading → content → loading → content
  const isSessionPending = session.isPending
  const isWaitingForCachedSession = hasCachedSession && session.isPending
  const isAuthenticatedButLoadingProfile = !!session.data && isLoadingProfile
  const isAuthenticatedButLoadingUserProfile = !!session.data && profileStatus?.isCompleted && isLoadingUserProfile

  const shouldShowLoading = isSessionPending
    || isWaitingForCachedSession
    || isAuthenticatedButLoadingProfile
    || isAuthenticatedButLoadingUserProfile

  if (shouldShowLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  // Not authenticated - show login
  // Only show login if we're certain there's no session (not pending and no cached session)
  if (!session.data && !hasCachedSession) {
    return <GoogleLogin />
  }

  // Edge case: cached session but Better Auth says no session
  // This means the session expired - clear cache and show login
  if (!session.data && hasCachedSession && !session.isPending) {
    return <GoogleLogin />
  }

  // Authenticated but profile not completed - redirect to onboarding
  if (isProfileStatusFetched && profileStatus && !profileStatus.isCompleted) {
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
