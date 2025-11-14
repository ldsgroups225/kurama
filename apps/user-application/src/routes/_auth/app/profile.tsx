import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppHeader, BottomNav } from "@/components/main";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { trackRouteLoad } from "@/lib/performance-monitor";
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
  Shield
} from "lucide-react";

export const Route = createFileRoute("/_auth/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-profile');
    return endTracking;
  }, []);

  const getUserInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      icon: User,
      label: "Informations Personnelles",
      href: "/app/profile/edit",
    },
    {
      icon: Settings,
      label: "Paramètres",
      href: "/app/settings",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/app/notifications",
    },
    {
      icon: Crown,
      label: "Passer à Premium",
      href: "/app/premium",
      badge: "Nouveau",
    },
    {
      icon: HelpCircle,
      label: "Aide & Support",
      href: "/app/help",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Mon Profil" showAvatar={false} />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {session?.user?.name || "Étudiant"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Niveau 5
                </Badge>
                <Badge variant="outline">
                  BAC 2024
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Cartes", value: "1,247" },
            { label: "Points", value: "8,450" },
            { label: "Série", value: "12j" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate({ to: item.href })}
                className="w-full"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <span className="font-medium text-foreground">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Se Déconnecter
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
