import type { UserType } from '@kurama/data-ops/zod-schema/profile'
import type { UserProfileData } from '@/lib/atoms'
import { useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { ParentProfileForm } from '@/components/onboarding/parent-profile-form'
import { StudentProfileForm } from '@/components/onboarding/student-profile-form'
import { UserTypeSelection } from '@/components/onboarding/user-type-selection'
import { hasCompletedOnboardingAtom, userProfileAtom } from '@/lib/atoms'
import { authClient } from '@/lib/auth-client'
import { trackRouteLoad } from '@/lib/performance-monitor'

export const Route = createLazyFileRoute('/onboarding')({
  component: OnboardingPage,
})

type OnboardingStep = 'userType' | 'form'

function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = authClient.useSession()
  const setHasCompletedOnboarding = useSetAtom(hasCompletedOnboardingAtom)
  const setUserProfile = useSetAtom(userProfileAtom)
  const [step, setStep] = useState<OnboardingStep>('userType')
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(
    null,
  )

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('onboarding')
    return endTracking
  }, [])

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedUserType(userType)
    setStep('form')
  }

  const handleBack = () => {
    setStep('userType')
    setSelectedUserType(null)
  }

  const handleSuccess = async (profileData?: UserProfileData) => {
    // Mark onboarding as completed
    setHasCompletedOnboarding(true)

    // Save user profile data to localStorage for quick access
    if (profileData) {
      setUserProfile(profileData)
    }

    // Invalidate profile-related queries to ensure fresh data
    await queryClient.invalidateQueries({
      queryKey: ['profile-status', session.data?.user?.id]
    })
    await queryClient.invalidateQueries({
      queryKey: ['user-profile', session.data?.user?.id]
    })

    // Redirect to main app after successful profile completion
    navigate({ to: '/app', replace: true })
  }

  // Render based on current step
  if (step === 'userType') {
    return <UserTypeSelection onSelect={handleUserTypeSelect} />
  }

  // Render appropriate form based on selected user type
  if (selectedUserType === 'student') {
    return (
      <StudentProfileForm onBack={handleBack} onSuccess={handleSuccess} />
    )
  }

  if (selectedUserType === 'parent') {
    return <ParentProfileForm onBack={handleBack} onSuccess={handleSuccess} />
  }

  // Fallback (should never reach here)
  return <UserTypeSelection onSelect={handleUserTypeSelect} />
}
