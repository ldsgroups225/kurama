import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { GoogleLogin } from '@/components/auth/google-login'
import {
  ConflictResolutionDialog,
  InstallPrompt,
  OfflineBanner,
  UpdatePrompt,
} from '@/components/pwa'
import { FullScreenLoader } from '@/components/ui/logo-loader'
import { getProfileStatus, getUserProfile } from '@/core/functions/profile'
import { useAuthPersistence } from '@/hooks'
import { userProfileAtom } from '@/lib/atoms'
import { authClient, isSigningOut, syncSessionCache } from '@/lib/auth-client'
import { hasCachedAuthenticatedSession } from '@/lib/auth-session-cache'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = authClient.useSession()
  const [, setUserProfile] = useAtom(userProfileAtom)
  const previousUserIdRef = useRef<string | null>(null)

  const userId = session.data?.user?.id

  // Check if we have a cached authenticated session for instant UI decisions
  const hasCachedSession = hasCachedAuthenticatedSession()

  // Sync session state to cache whenever it changes
  useEffect(() => {
    if (!session.isPending) {
      syncSessionCache(session)
    }
  }, [session])

  // Enable auth token persistence
  useAuthPersistence()

  // Invalidate queries when user changes (different user or signed out)
  useEffect(() => {
    const currentUserId = session.data?.user?.id ?? null
    const previousUserId = previousUserIdRef.current

    const hadPreviousUser = previousUserId !== null
    const userChanged = previousUserId !== currentUserId

    if (hadPreviousUser && userChanged) {
      // Clear user profile atom
      setUserProfile(null)
    }

    previousUserIdRef.current = currentUserId
  }, [session.data?.user?.id, setUserProfile])

  // Check profile completion status when user is authenticated
  const { data: profileStatus, isPending: isPendingProfile, isFetched: isProfileStatusFetched } = useQuery({
    queryKey: ['profile-status', userId],
    queryFn: () => getProfileStatus(),
    enabled: !!userId && !isSigningOut(),
  })

  // Fetch and cache user profile if completed
  const { data: userProfile, isPending: isPendingUserProfile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(),
    enabled: !!userId && !isSigningOut() && profileStatus?.isCompleted === true,
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
  const isAuthenticatedButLoadingProfile = !!session.data && isPendingProfile
  const isAuthenticatedButLoadingUserProfile = !!session.data && profileStatus?.isCompleted && isPendingUserProfile

  const shouldShowLoading = isSessionPending
    || isSigningOut()
    || isWaitingForCachedSession
    || isAuthenticatedButLoadingProfile
    || isAuthenticatedButLoadingUserProfile

  if (shouldShowLoading) {
    return <FullScreenLoader />
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
