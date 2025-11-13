import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { hasCompletedOnboardingAtom } from "@/lib/atoms";
import { WelcomeScreen } from "@/components/onboarding/welcome-screen";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { NavigationBar } from "@/components/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ClaudeCodeSection } from "@/components/landing/claude-code-section";
import { CoursePromoSection } from "@/components/landing/course-promo-section";
import { Footer } from "@/components/landing/footer";
import { MiddlewareDemo } from "@/components/demo";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useAtom(
    hasCompletedOnboardingAtom
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration to complete before showing conditional content
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Prevent hydration mismatch by waiting for client-side hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main>
          <HeroSection />
          <ClaudeCodeSection />
          <FeaturesSection />
          <MiddlewareDemo />
          <CoursePromoSection />
        </main>
        <Footer />
      </div>
    );
  }

  // Show welcome screen if first time user
  if (!hasCompletedOnboarding && !showOnboarding) {
    return (
      <WelcomeScreen
        onGetStarted={() => setShowOnboarding(true)}
      />
    );
  }

  // Show onboarding flow
  if (!hasCompletedOnboarding && showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => setHasCompletedOnboarding(true)}
        onSkip={() => setHasCompletedOnboarding(true)}
      />
    );
  }

  // Show main app after onboarding
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main>
        <HeroSection />
        <ClaudeCodeSection />
        <FeaturesSection />
        <MiddlewareDemo />
        <CoursePromoSection />
      </main>
      <Footer />
    </div>
  );
}
