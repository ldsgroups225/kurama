import { createLazyFileRoute } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { Suspense, useEffect, useState } from 'react'
import { FormSkeleton, PageSkeleton } from '@/components/skeletons'
import { hasCompletedOnboardingAtom } from '@/lib/atoms'
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

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('landing')
    return endTracking
  }, [])

  // Show welcome screen if first time user
  if (!hasCompletedOnboarding && !showOnboarding) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <WelcomeScreen
          onGetStarted={() => setShowOnboarding(true)}
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
