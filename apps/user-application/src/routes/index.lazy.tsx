import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { Suspense, useEffect, useState } from 'react'
import { FormSkeleton, PageSkeleton } from '@/components/skeletons'
import { FullScreenLoader } from '@/components/ui/logo-loader'
import { hasCompletedOnboardingAtom } from '@/lib/atoms'
import { authClient, syncSessionCache } from '@/lib/auth-client'
import { hasCachedAuthenticatedSession } from '@/lib/auth-session-cache'
import { createLazyComponent } from '@/lib/lazy-helpers'
import { trackRouteLoad } from '@/lib/performance-monitor'

// Lazy load auth and onboarding screens
const AuthScreen = createLazyComponent(() => import('@/components/auth/auth-screen'))
const WelcomeScreen = createLazyComponent(() => import('@/components/onboarding/welcome-screen'))
const OnboardingScreen = createLazyComponent(() => import('@/components/onboarding/onboarding-screen'))

export const Route = createLazyFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useAtom(
    hasCompletedOnboardingAtom,
  )
  const [showOnboarding, setShowOnboarding] = useState(false)
  const session = authClient.useSession()
  const navigate = useNavigate()

  // Check if we have a cached authenticated session for instant redirect
  const [hasCachedSession] = useState(() => hasCachedAuthenticatedSession())

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('landing')
    return endTracking
  }, [])

  // Sync session state to cache whenever it changes
  useEffect(() => {
    if (!session.isPending) {
      syncSessionCache(session)
    }
  }, [session])

  // Redirect authenticated users to app
  useEffect(() => {
    if (session.data) {
      navigate({ to: '/app' })
    }
  }, [session.data, navigate])

  // Show loading state while checking auth to prevent flash
  // Key insight: if we have a cached session, keep showing loading until Better Auth
  // confirms the session status (prevents auth screen flash on reload)
  const isCheckingAuth = session.isPending
  const hasConfirmedSession = !session.isPending && session.data
  const hasCachedButPending = hasCachedSession && session.isPending

  if (isCheckingAuth || hasCachedButPending || hasConfirmedSession) {
    return <FullScreenLoader />
  }

  // Show welcome screen if first time user
  if (!hasCompletedOnboarding && !showOnboarding) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <WelcomeScreen
          onGetStarted={() => setShowOnboarding(true)}
          onSignIn={() => setHasCompletedOnboarding(true)}
        />
      </Suspense>
    )
  }

  // Show onboarding flow
  if (!hasCompletedOnboarding && showOnboarding) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <OnboardingScreen
          onComplete={() => setHasCompletedOnboarding(true)}
          onSkip={() => setHasCompletedOnboarding(true)}
        />
      </Suspense>
    )
  }

  // Show auth screen if not authenticated
  return (
    <Suspense fallback={<FormSkeleton />}>
      <AuthScreen />
    </Suspense>
  )
}
