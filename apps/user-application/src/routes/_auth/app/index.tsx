import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, BottomNav, ChallengeCard, StatsGrid, QuickActions } from "@/components/main";
import {
  LevelBadge,
  AchievementShowcase,
  StreakCalendar,
  LeaderboardWidget,
  type Achievement,
  type LeaderboardEntry
} from "@/components/gamification";
import {
  BookOpen,
  Brain,
  Trophy,
  Zap,
  Target,
  Clock,
  Flame,
  Users,
  FileText,
  Gamepad2,
  Timer,
  GraduationCap,
  Star,
  Rocket,
  Crown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_auth/app/")({
  component: AppHome,
});

function AppHome() {
  // Mock data - Replace with real data from your backend
  const userLevel = {
    level: 12,
    currentXP: 2450,
    nextLevelXP: 3000,
  };

  const achievements: Achievement[] = [
    {
      id: "1",
      name: "Premier Pas",
      description: "Complétez votre première leçon",
      icon: Star,
      color: "from-blue-400 to-blue-600",
      unlocked: true,
      unlockedAt: new Date("2024-01-15"),
      rarity: "common",
    },
    {
      id: "2",
      name: "Série de Feu",
      description: "Maintenez une série de 7 jours",
      icon: Flame,
      color: "from-orange-400 to-red-500",
      unlocked: true,
      unlockedAt: new Date("2024-02-01"),
      rarity: "rare",
    },
    {
      id: "3",
      name: "Maître du Quiz",
      description: "Obtenez 100% à 10 quiz",
      icon: Trophy,
      color: "from-amber-400 to-orange-500",
      unlocked: true,
      unlockedAt: new Date("2024-02-10"),
      rarity: "epic",
    },
    {
      id: "4",
      name: "Étudiant Légendaire",
      description: "Atteignez le niveau 50",
      icon: Crown,
      color: "from-amber-400 to-orange-500",
      unlocked: false,
      progress: 12,
      maxProgress: 50,
      rarity: "legendary",
    },
    {
      id: "5",
      name: "Mathématicien",
      description: "Complétez tous les chapitres de maths",
      icon: Target,
      color: "from-purple-400 to-purple-600",
      unlocked: false,
      progress: 8,
      maxProgress: 12,
      rarity: "epic",
    },
    {
      id: "6",
      name: "Fusée",
      description: "Étudiez 30 jours d'affilée",
      icon: Rocket,
      color: "from-blue-400 to-blue-600",
      unlocked: false,
      progress: 12,
      maxProgress: 30,
      rarity: "rare",
    },
  ];

  const leaderboardData: LeaderboardEntry[] = [
    {
      id: "1",
      name: "Aminata Koné",
      avatar: undefined,
      points: 3450,
      rank: 1,
      previousRank: 2,
    },
    {
      id: "2",
      name: "Darius Kassi",
      avatar: undefined,
      points: 3240,
      rank: 2,
      previousRank: 1,
      isCurrentUser: true,
    },
    {
      id: "3",
      name: "Fatou Traoré",
      avatar: undefined,
      points: 2980,
      rank: 3,
      previousRank: 3,
    },
    {
      id: "4",
      name: "Kouassi Yao",
      avatar: undefined,
      points: 2750,
      rank: 4,
      previousRank: 5,
    },
    {
      id: "5",
      name: "Mariam Diallo",
      avatar: undefined,
      points: 2650,
      rank: 5,
      previousRank: 4,
    },
  ];

  const streakData = {
    currentStreak: 12,
    longestStreak: 28,
    streakHistory: Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date,
        completed: i >= 2, // Last 12 days completed
        count: i >= 2 ? 1 : 0,
      };
    }),
  };

  const stats = [
    {
      icon: BookOpen,
      label: "Cartes Étudiées",
      value: "247",
      subValue: "24 aujourd'hui",
      color: "text-blue-500",
      progress: 65,
    },
    {
      icon: Trophy,
      label: "Points Gagnés",
      value: "1,240",
      subValue: "+120 cette semaine",
      color: "text-amber-500",
      progress: 80,
    },
    {
      icon: Target,
      label: "Objectif Quotidien",
      value: "18/25",
      subValue: "7 cartes restantes",
      color: "text-green-500",
      progress: 72,
    },
    {
      icon: Flame,
      label: "Série Actuelle",
      value: "12 jours",
      subValue: "Record: 28 jours",
      color: "text-orange-500",
      progress: 43,
    },
  ];

  const quickActions = [
    {
      icon: Brain,
      label: "Révision Rapide",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: Gamepad2,
      label: "Quiz",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Timer,
      label: "Chrono",
      color: "bg-green-500/10 text-green-500",
    },
    {
      icon: FileText,
      label: "Examen Blanc",
      color: "bg-red-500/10 text-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Level Progress */}
        <section>
          <LevelBadge
            level={userLevel.level}
            currentXP={userLevel.currentXP}
            nextLevelXP={userLevel.nextLevelXP}
          />
        </section>

        {/* Daily Challenge */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Défi du Jour</h2>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              23h 45m
            </Badge>
          </div>
          <ChallengeCard
            title="Révision Mathématiques"
            description="Complétez 25 cartes de géométrie et algèbre"
            duration="15-20 min"
            icon={<GraduationCap className="h-6 w-6 text-primary" />}
          />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Actions Rapides</h2>
          <QuickActions actions={quickActions} />
        </section>

        {/* Streak Calendar */}
        <section>
          <StreakCalendar
            currentStreak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
            streakHistory={streakData.streakHistory}
          />
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Vos Statistiques</h2>
          <StatsGrid stats={stats} />
        </section>

        {/* Achievements */}
        <section>
          <AchievementShowcase achievements={achievements} />
        </section>

        {/* Leaderboard */}
        <section>
          <LeaderboardWidget
            entries={leaderboardData}
            currentUserId="2"
            title="Classement Hebdomadaire"
          />
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Activité Récente</h2>
            <button className="text-sm text-primary hover:underline">
              Voir tout
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                subject: "Physique-Chimie",
                action: "20 cartes révisées",
                time: "Il y a 2h",
                icon: Zap,
                color: "text-purple-500",
              },
              {
                subject: "Histoire-Géo",
                action: "Quiz complété (85%)",
                time: "Il y a 5h",
                icon: Trophy,
                color: "text-amber-500",
              },
              {
                subject: "Groupe d'étude",
                action: "Nouveau message",
                time: "Il y a 1j",
                icon: Users,
                color: "text-blue-500",
              },
            ].map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-background ${activity.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
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
