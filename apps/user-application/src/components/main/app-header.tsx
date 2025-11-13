import { Bell } from "lucide-react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { userProfileAtom } from "@/lib/atoms";
import { LevelBadge } from "@/components/gamification";

interface AppHeaderProps {
  title?: string;
  showAvatar?: boolean;
  showNotifications?: boolean;
  showLevel?: boolean;
  userLevel?: {
    level: number;
    currentXP: number;
    nextLevelXP: number;
  };
}

export function AppHeader({
  title,
  showAvatar = true,
  showNotifications = true,
  showLevel = false,
  userLevel
}: AppHeaderProps) {
  // Use cached profile data from localStorage for instant access
  const [userProfile] = useAtom(userProfileAtom);
  // Fallback to session data if profile not cached
  const { data: session } = useSession();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getUserInitials = () => {
    // Try to get initials from cached profile first
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    // Fallback to session name
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  const getUserDisplayName = () => {
    // Try cached profile first for instant display
    if (userProfile?.firstName) {
      return userProfile.firstName;
    }
    // Fallback to session
    return session?.user?.name || "Étudiant";
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border">
      <div className="mx-auto max-w-lg px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showAvatar && (
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              {title ? (
                <h1 className="text-xl font-bold text-foreground">{title}</h1>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{getGreeting()}</p>
                  <h1 className="text-lg font-bold text-foreground">
                    {getUserDisplayName()}
                  </h1>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showNotifications && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              </Button>
            )}
          </div>
        </div>

        {/* Compact Level Badge */}
        {showLevel && userLevel && (
          <div className="mt-3">
            <LevelBadge
              level={userLevel.level}
              currentXP={userLevel.currentXP}
              nextLevelXP={userLevel.nextLevelXP}
              compact
            />
          </div>
        )}
      </div>
    </header>
  );
}
