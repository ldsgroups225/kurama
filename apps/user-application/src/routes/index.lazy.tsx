import { createLazyFileRoute } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { Suspense, useEffect, useState } from 'react'
import { NavigationBar } from '@/components/navigation'
import { FooterSkeleton, FormSkeleton, HeroSkeleton, PageSkeleton, SectionSkeleton, StatsSkeleton } from '@/components/skeletons'
import { hasCompletedOnboardingAtom } from '@/lib/atoms'
import { useSession } from '@/lib/auth-client'
import { createLazyComponent } from '@/lib/lazy-helpers'
import { trackRouteLoad } from '@/lib/performance-monitor'

// Lazy load auth and onboarding screens
const AuthScreen = createLazyComponent(() => import('@/components/auth/auth-screen'))
const WelcomeScreen = createLazyComponent(() => import('@/components/onboarding/welcome-screen'))
const OnboardingScreen = createLazyComponent(() => import('@/components/onboarding/onboarding-screen'))

// Lazy load landing page sections
const HeroSection = createLazyComponent(() => import('@/components/landing/hero-section'))
const StatsSection = createLazyComponent(() => import('@/components/landing/stats-section'))
const SubjectsSection = createLazyComponent(() => import('@/components/landing/subjects-section'))
const FeaturesSection = createLazyComponent(() => import('@/components/landing/features-section'))
const HowItWorksSection = createLazyComponent(() => import('@/components/landing/how-it-works-section'))
const TestimonialsSection = createLazyComponent(() => import('@/components/landing/testimonials-section'))
const CTASection = createLazyComponent(() => import('@/components/landing/cta-section'))
const Footer = createLazyComponent(() => import('@/components/landing/footer'))

export const Route = createLazyFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useAtom(
    hasCompletedOnboardingAtom,
  )
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const { data: session, isPending } = useSession()

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('landing')
    return endTracking
  }, [])

  // Wait for hydration to complete before showing conditional content
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsHydrated(true)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  // Redirect authenticated users to app
  useEffect(() => {
    if (session && typeof window !== 'undefined') {
      window.location.href = '/app'
    }
  }, [session])

  // Prevent hydration mismatch by waiting for client-side hydration
  if (!isHydrated || isPending) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main>
          <Suspense fallback={<HeroSkeleton />}>
            <HeroSection />
          </Suspense>
          <Suspense fallback={<StatsSkeleton />}>
            <StatsSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <SubjectsSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <FeaturesSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <HowItWorksSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <TestimonialsSection />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <CTASection />
          </Suspense>
        </main>
        <Suspense fallback={<FooterSkeleton />}>
          <Footer />
        </Suspense>
      </div>
    )
  }

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
  if (!session) {
    return (
      <Suspense fallback={<FormSkeleton />}>
        <AuthScreen />
      </Suspense>
    )
  }

  // Fallback for SSR and during redirection
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirection...</p>
    </div>
  )
}
