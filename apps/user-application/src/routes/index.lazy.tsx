import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect, Suspense } from "react";
import { useAtom } from "jotai";
import { hasCompletedOnboardingAtom } from "@/lib/atoms";
import { FormSkeleton, PageSkeleton } from "@/components/skeletons";
import { trackRouteLoad } from "@/lib/performance-monitor";

// Lazy load auth and onboarding screens
const AuthScreen = createLazyComponent(() => import("@/components/auth/auth-screen"));
const WelcomeScreen = createLazyComponent(() => import("@/components/onboarding/welcome-screen"));
const OnboardingScreen = createLazyComponent(() => import("@/components/onboarding/onboarding-screen"));
import { useSession } from "@/lib/auth-client";
import { NavigationBar } from "@/components/navigation";
import { createLazyComponent } from "@/lib/lazy-component";
import {
  HeroSkeleton,
  StatsSkeleton,
  SectionSkeleton,
  FooterSkeleton
} from "@/components/skeletons";

// Lazy load landing page sections
const HeroSection = createLazyComponent(() => import("@/components/landing/hero-section"));
const StatsSection = createLazyComponent(() => import("@/components/landing/stats-section"));
const SubjectsSection = createLazyComponent(() => import("@/components/landing/subjects-section"));
const FeaturesSection = createLazyComponent(() => import("@/components/landing/features-section"));
const HowItWorksSection = createLazyComponent(() => import("@/components/landing/how-it-works-section"));
const TestimonialsSection = createLazyComponent(() => import("@/components/landing/testimonials-section"));
const CTASection = createLazyComponent(() => import("@/components/landing/cta-section"));
const Footer = createLazyComponent(() => import("@/components/landing/footer"));

export const Route = createLazyFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useAtom(
    hasCompletedOnboardingAtom
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: session, isPending } = useSession();

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('landing');
    return endTracking;
  }, []);

  // Wait for hydration to complete before showing conditional content
  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
    );
  }

  // Show welcome screen if first time user
  if (!hasCompletedOnboarding && !showOnboarding) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <WelcomeScreen
          onGetStarted={() => setShowOnboarding(true)}
        />
      </Suspense>
    );
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
    );
  }

  // Show auth screen if not authenticated
  if (!session) {
    return (
      <Suspense fallback={<FormSkeleton />}>
        <AuthScreen />
      </Suspense>
    );
  }

  // Redirect authenticated users to app
  if (typeof window !== "undefined") {
    window.location.href = "/app";
    return null;
  }

  // Fallback for SSR
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirection...</p>
    </div>
  );
}
