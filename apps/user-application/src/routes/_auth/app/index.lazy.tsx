import type { Achievement, LeaderboardEntry } from '@/components/gamification'
import { useQuery } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import {
  BookOpen,
  Brain,
  Clock,
  Crown,
  FileText,
  Flame,
  Gamepad2,
  GraduationCap,
  Rocket,
  Star,
  Target,
  Timer,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { useEffect } from 'react'
import {

  AchievementShowcase,

  LeaderboardWidget,
  LevelBadge,
  StreakCalendar,
} from '@/components/gamification'
import { AppHeader, BottomNav, ChallengeCard, QuickActions, StatsGrid } from '@/components/main'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats } from '@/core/functions/dashboard'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createLazyFileRoute('/_auth/app/')({
  component: AppHome,
})

function AppHome() {
  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-dashboard')
    return endTracking
  }, [])

  // Fetch real dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(),
  })

  // Mock data - Replace with real data from your backend
  const userLevel = {
    level: Math.floor((dashboardData?.totalXP ?? 0) / 500) + 1,
    currentXP: (dashboardData?.totalXP ?? 0) % 500,
    nextLevelXP: 500,
  }

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Premier Pas',
      description: 'Complétez votre première leçon',
      icon: Star,
      color: 'bg-gradient-xp',
      unlocked: true,
      unlockedAt: new Date('2024-01-15'),
      rarity: 'common',
    },
    {
      id: '2',
      name: 'Série de Feu',
      description: 'Maintenez une série de 7 jours',
      icon: Flame,
      color: 'bg-gradient-streak',
      unlocked: true,
      unlockedAt: new Date('2024-02-01'),
      rarity: 'rare',
    },
    {
      id: '3',
      name: 'Maître du Quiz',
      description: 'Obtenez 100% à 10 quiz',
      icon: Trophy,
      color: 'bg-gradient-level',
      unlocked: true,
      unlockedAt: new Date('2024-02-10'),
      rarity: 'epic',
    },
    {
      id: '4',
      name: 'Étudiant Légendaire',
      description: 'Atteignez le niveau 50',
      icon: Crown,
      color: 'bg-gradient-legendary',
      unlocked: false,
      progress: 12,
      maxProgress: 50,
      rarity: 'legendary',
    },
    {
      id: '5',
      name: 'Mathématicien',
      description: 'Complétez tous les chapitres de maths',
      icon: Target,
      color: 'bg-gradient-epic',
      unlocked: false,
      progress: 8,
      maxProgress: 12,
      rarity: 'epic',
    },
    {
      id: '6',
      name: 'Fusée',
      description: 'Étudiez 30 jours d\'affilée',
      icon: Rocket,
      color: 'bg-gradient-rare',
      unlocked: false,
      progress: 12,
      maxProgress: 30,
      rarity: 'rare',
    },
  ]

  const leaderboardData: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Aminata Koné',
      avatar: undefined,
      points: 3450,
      rank: 1,
      previousRank: 2,
    },
    {
      id: '2',
      name: 'Darius Kassi',
      avatar: undefined,
      points: 3240,
      rank: 2,
      previousRank: 1,
      isCurrentUser: true,
    },
    {
      id: '3',
      name: 'Fatou Traoré',
      avatar: undefined,
      points: 2980,
      rank: 3,
      previousRank: 3,
    },
    {
      id: '4',
      name: 'Kouassi Yao',
      avatar: undefined,
      points: 2750,
      rank: 4,
      previousRank: 5,
    },
    {
      id: '5',
      name: 'Mariam Diallo',
      avatar: undefined,
      points: 2650,
      rank: 5,
      previousRank: 4,
    },
  ]

  const streakData = {
    currentStreak: dashboardData?.currentStreak ?? 0,
    longestStreak: dashboardData?.longestStreak ?? 0,
    streakHistory: Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (13 - i))
      return {
        date,
        completed: i >= (14 - (dashboardData?.currentStreak ?? 0)),
        count: i >= (14 - (dashboardData?.currentStreak ?? 0)) ? 1 : 0,
      }
    }),
  }

  const stats = [
    {
      icon: BookOpen,
      label: 'Cartes Étudiées',
      value: String(dashboardData?.totalCardsStudied ?? 0),
      subValue: `${dashboardData?.cardsStudiedToday ?? 0} aujourd'hui`,
      color: 'text-xp',
      progress: Math.min(((dashboardData?.cardsStudiedToday ?? 0) / 25) * 100, 100),
    },
    {
      icon: Trophy,
      label: 'Points Gagnés',
      value: String(dashboardData?.totalXP ?? 0),
      subValue: `Niveau ${userLevel.level}`,
      color: 'text-level',
      progress: (userLevel.currentXP / userLevel.nextLevelXP) * 100,
    },
    {
      icon: Target,
      label: 'Objectif Quotidien',
      value: `${dashboardData?.cardsStudiedToday ?? 0}/25`,
      subValue: `${Math.max(0, 25 - (dashboardData?.cardsStudiedToday ?? 0))} cartes restantes`,
      color: 'text-success',
      progress: Math.min(((dashboardData?.cardsStudiedToday ?? 0) / 25) * 100, 100),
    },
    {
      icon: Flame,
      label: 'Série Actuelle',
      value: `${dashboardData?.currentStreak ?? 0} jours`,
      subValue: `Record: ${dashboardData?.longestStreak ?? 0} jours`,
      color: 'text-streak',
      progress: Math.min(((dashboardData?.currentStreak ?? 0) / (dashboardData?.longestStreak || 1)) * 100, 100),
    },
  ]

  const quickActions = [
    {
      icon: Brain,
      label: 'Révision Rapide',
      color: 'bg-epic text-epic',
    },
    {
      icon: Gamepad2,
      label: 'Quiz',
      color: 'bg-xp text-xp',
    },
    {
      icon: Timer,
      label: 'Chrono',
      color: 'bg-success text-success',
    },
    {
      icon: FileText,
      label: 'Examen Blanc',
      color: 'bg-error text-error',
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
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
          <div className="mb-4 flex items-center justify-between">
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
          <h2 className="mb-4 text-lg font-bold text-foreground">Actions Rapides</h2>
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
          <h2 className="mb-4 text-lg font-bold text-foreground">Vos Statistiques</h2>
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Activité Récente</h2>
            <button
              type="button"
              className={`
                text-sm text-primary
                hover:underline
              `}
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                subject: 'Physique-Chimie',
                action: '20 cartes révisées',
                time: 'Il y a 2h',
                icon: Zap,
                color: 'text-epic',
              },
              {
                subject: 'Histoire-Géo',
                action: 'Quiz complété (85%)',
                time: 'Il y a 5h',
                icon: Trophy,
                color: 'text-level',
              },
              {
                subject: 'Groupe d\'étude',
                action: 'Nouveau message',
                time: 'Il y a 1j',
                icon: Users,
                color: 'text-xp',
              },
            ].map((activity) => {
              const Icon = activity.icon
              return (
                <div
                  key={generateUUID()}
                  className={`
                    flex items-center gap-3 rounded-xl bg-muted/50 p-4
                    transition-colors
                    hover:bg-muted
                  `}
                >
                  <div className={`
                    flex h-10 w-10 items-center justify-center rounded-full
                    bg-background
                    ${activity.color}
                  `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {activity.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <span className={`
                    text-xs whitespace-nowrap text-muted-foreground
                  `}
                  >
                    {activity.time}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
