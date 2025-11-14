import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppHeader, BottomNav, StatsGrid } from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackRouteLoad } from "@/lib/performance-monitor";
import {
  TrendingUp,
  Target,
  Award,
  Calendar,
  Flame,
  BookOpen,
  Trophy,
  Clock
} from "lucide-react";

export const Route = createFileRoute("/_auth/app/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-progress');
    return endTracking;
  }, []);

  const stats = [
    {
      icon: BookOpen,
      label: "Total Cartes",
      value: "1,247",
      subValue: "Sur 5,000",
      color: "text-xp",
      progress: 25,
    },
    {
      icon: Trophy,
      label: "Points",
      value: "8,450",
      subValue: "Top 15%",
      color: "text-level",
      progress: 85,
    },
    {
      icon: Flame,
      label: "Série",
      value: "12 jours",
      subValue: "Record: 28",
      color: "text-streak",
      progress: 43,
    },
    {
      icon: Clock,
      label: "Temps Total",
      value: "24h",
      subValue: "Ce mois",
      color: "text-success",
      progress: 60,
    },
  ];

  const weeklyData = [
    { day: "L", value: 85 },
    { day: "M", value: 92 },
    { day: "M", value: 78 },
    { day: "J", value: 95 },
    { day: "V", value: 88 },
    { day: "S", value: 70 },
    { day: "D", value: 65 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Mes Progrès" showAvatar={false} />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Vue d'Ensemble</h2>
          <StatsGrid stats={stats} />
        </section>

        {/* Weekly Activity */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activité de la Semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-32">
                {weeklyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-muted rounded-t-lg relative overflow-hidden">
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all duration-500"
                        style={{ height: `${data.value}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {data.day}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Achievements */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Badges Débloqués</h2>
            <span className="text-sm text-muted-foreground">5/20</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Award, label: "Débutant", unlocked: true, color: "text-level" },
              { icon: Flame, label: "Série 7j", unlocked: true, color: "text-streak" },
              { icon: Target, label: "100 Cartes", unlocked: true, color: "text-xp" },
              { icon: TrendingUp, label: "Progrès", unlocked: true, color: "text-success" },
              { icon: Calendar, label: "Régulier", unlocked: true, color: "text-epic" },
              { icon: Trophy, label: "Expert", unlocked: false, color: "text-muted-foreground" },
              { icon: BookOpen, label: "Lecteur", unlocked: false, color: "text-muted-foreground" },
              { icon: Award, label: "Champion", unlocked: false, color: "text-muted-foreground" },
            ].map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl ${badge.unlocked ? "bg-muted" : "bg-muted/30"
                    }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${badge.unlocked ? "bg-background" : "bg-muted"
                    } ${badge.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-center font-medium text-muted-foreground">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
