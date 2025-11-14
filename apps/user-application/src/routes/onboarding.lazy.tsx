import { useState, useEffect } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { UserTypeSelection } from "@/components/onboarding/user-type-selection";
import { StudentProfileForm } from "@/components/onboarding/student-profile-form";
import { ParentProfileForm } from "@/components/onboarding/parent-profile-form";
import { hasCompletedOnboardingAtom, userProfileAtom, UserProfileData } from "@/lib/atoms";
import { trackRouteLoad } from "@/lib/performance-monitor";
import type { UserType } from "@kurama/data-ops/zod-schema/profile";

export const Route = createLazyFileRoute("/onboarding")({
  component: OnboardingPage,
});

type OnboardingStep = "userType" | "form";

function OnboardingPage() {
  const navigate = useNavigate();
  const setHasCompletedOnboarding = useSetAtom(hasCompletedOnboardingAtom);
  const setUserProfile = useSetAtom(userProfileAtom);
  const [step, setStep] = useState<OnboardingStep>("userType");
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(
    null
  );

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('onboarding');
    return endTracking;
  }, []);

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedUserType(userType);
    setStep("form");
  };

  const handleBack = () => {
    setStep("userType");
    setSelectedUserType(null);
  };

  const handleSuccess = (profileData?: UserProfileData) => {
    // Mark onboarding as completed
    setHasCompletedOnboarding(true);

    // Save user profile data to localStorage for quick access
    if (profileData) {
      setUserProfile(profileData);
    }

    // Redirect to main app after successful profile completion
    navigate({ to: "/app" });
  };

  // Render based on current step
  if (step === "userType") {
    return <UserTypeSelection onSelect={handleUserTypeSelect} />;
  }

  // Render appropriate form based on selected user type
  if (selectedUserType === "student") {
    return (
      <StudentProfileForm onBack={handleBack} onSuccess={handleSuccess} />
    );
  }

  if (selectedUserType === "parent") {
    return <ParentProfileForm onBack={handleBack} onSuccess={handleSuccess} />;
  }

  // Fallback (should never reach here)
  return <UserTypeSelection onSelect={handleUserTypeSelect} />;
}
