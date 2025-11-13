import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { GoogleLogin } from "@/components/auth/google-login";
import { authClient } from "@/lib/auth-client";
import { getProfileStatus, getUserProfile } from "@/core/functions/profile";
import { userProfileAtom } from "@/lib/atoms";
import { useEffect } from "react";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();
  const setUserProfile = useSetAtom(userProfileAtom);

  // Check profile completion status when user is authenticated
  const { data: profileStatus, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile-status"],
    queryFn: () => getProfileStatus(),
    enabled: !!session.data, // Only run when user is authenticated
  });

  // Fetch and cache user profile if completed
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => getUserProfile(),
    enabled: !!session.data && profileStatus?.isCompleted === true,
  });

  // Cache profile data in localStorage when fetched
  useEffect(() => {
    if (userProfile && session.data?.user) {
      setUserProfile({
        userType: userProfile.userType,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: session.data.user.email ?? undefined,
        image: session.data.user.image ?? undefined,
        name: session.data.user.name ?? undefined,
        phone: userProfile.phone ?? undefined,
        age: userProfile.age ?? undefined,
        gender: userProfile.gender ?? undefined,
        city: userProfile.city ?? undefined,
        idNumber: userProfile.idNumber ?? undefined,
        gradeName: userProfile.grade?.name ?? undefined,
        seriesName: userProfile.series?.name ?? undefined,
        favoriteSubjects: userProfile.favoriteSubjects as string[] | undefined,
        learningGoals: userProfile.learningGoals ?? undefined,
        studyTime: userProfile.studyTime ?? undefined,
        childrenMatricules: userProfile.childrenMatricules as number[] | undefined,
      });
    }
  }, [userProfile, session.data, setUserProfile]);

  // Show loading spinner while checking auth or profile
  if (session.isPending || (session.data && isLoadingProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!session.data) {
    return <GoogleLogin />;
  }

  // Authenticated but profile not completed - redirect to onboarding
  if (profileStatus && !profileStatus.isCompleted) {
    return <Navigate to="/onboarding" />;
  }

  // Authenticated and profile completed - show app
  return <Outlet />;
}
