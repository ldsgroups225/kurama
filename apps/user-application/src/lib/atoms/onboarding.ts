import { atomWithToggleAndStorage } from "./atomWithToggleAndStorage";

// Track if user has completed onboarding
export const hasCompletedOnboardingAtom = atomWithToggleAndStorage(
  "kurama:hasCompletedOnboarding",
  false
);
