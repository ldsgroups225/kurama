import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { useEffect } from 'react'
import { AppHeader, BottomNav, StatsGrid } from '@/components/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProgressStats } from '@/core/functions/progress'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { generateUUID } from '@/utils/generateUUID'

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ''}`} />
}

export const Route = createFileRoute('/_auth/app/progress')({
  component: ProgressPage,
})

// Icon mapping for achievements
const iconMap: Record<string, typeof Award> = {
  Award,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Trophy,
  BookOpen,
}

function ProgressPage() {
  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-progress')
    return endTracking
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['progress-stats'],
    queryFn: () => getProgressStats(),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <AppHeader title="Mes Progrès" showAvatar={false} />
        <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
          <section>
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </section>
          <section>
            <Skeleton className="h-48 rounded-xl" />
          </section>
          <section>
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </section>
        </main>
        <BottomNav />
      </div>
    )
  }

  const cardsProgress = data?.totalCardsAvailable
    ? Math.round((data.totalCardsStudied / data.totalCardsAvailable) * 100)
    : 0

  const streakProgress = data?.longestStreak
    ? Math.round((data.currentStreak / data.longestStreak) * 100)
    : 0

  const stats = [
    {
      icon: BookOpen,
      label: 'Total Cartes',
      value: data?.totalCardsStudied.toLocaleString() ?? '0',
      subValue: `Sur ${data?.totalCardsAvailable.toLocaleString() ?? '0'}`,
      color: 'text-xp',
      progress: cardsProgress,
    },
    {
      icon: Trophy,
      label: 'Points',
      value: data?.totalXP.toLocaleString() ?? '0',
      subValue: `Top ${100 - (data?.rankPercentage ?? 0)}%`,
      color: 'text-level',
      progress: Math.min((data?.totalXP ?? 0) / 100, 100),
    },
    {
      icon: Flame,
      label: 'Série',
      value: `${data?.currentStreak ?? 0} jours`,
      subValue: `Record: ${data?.longestStreak ?? 0}`,
      color: 'text-streak',
      progress: streakProgress,
    },
    {
      icon: Clock,
      label: 'Temps Total',
      value: `${data?.totalStudyTimeHours ?? 0}h`,
      subValue: 'Ce mois',
      color: 'text-success',
      progress: Math.min((data?.totalStudyTimeHours ?? 0) / 24 * 100, 100),
    },
  ]

  // Calculate max value for weekly chart scaling
  const maxWeeklyValue = Math.max(
    ...((data?.weeklyActivity ?? []).map(d => d.cardsStudied)),
    1,
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Mes Progrès" showAvatar={false} />

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* Stats Overview */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Vue d'Ensemble</h2>
          <StatsGrid stats={stats} />
        </section>

        {/* Weekly Activity */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activité de la Semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-end justify-between gap-2">
                {(data?.weeklyActivity ?? []).map((dayData) => {
                  const height = maxWeeklyValue > 0
                    ? Math.max((dayData.cardsStudied / maxWeeklyValue) * 100, 4)
                    : 4

                  return (
                    <div
                      key={`${dayData.date}-${generateUUID()}`}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="relative w-full overflow-hidden rounded-t-lg bg-muted h-24 flex items-end">
                        <div
                          className="w-full rounded-t-lg bg-primary transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          {dayData.day}
                        </span>
                        {dayData.cardsStudied > 0 && (
                          <div className="text-[10px] text-primary font-medium">
                            {dayData.cardsStudied}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Achievements */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Badges Débloqués</h2>
            <span className="text-sm text-muted-foreground">
              {data?.unlockedCount ?? 0}
              /
              {data?.totalAchievements ?? 0}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {(data?.achievements ?? []).map((badge) => {
              const Icon = iconMap[badge.icon] ?? Award
              const colorClass = badge.unlocked
                ? badge.icon === 'Flame'
                  ? 'text-streak'
                  : badge.icon === 'Target'
                    ? 'text-xp'
                    : badge.icon === 'TrendingUp'
                      ? 'text-success'
                      : badge.icon === 'Calendar'
                        ? 'text-epic'
                        : badge.icon === 'Trophy'
                          ? 'text-level'
                          : 'text-level'
                : 'text-muted-foreground'

              return (
                <div
                  key={badge.id}
                  className={`
                    flex flex-col items-center gap-2 rounded-xl p-3
                    ${badge.unlocked ? 'bg-muted' : 'bg-muted/30'}
                  `}
                  title={badge.description}
                >
                  <div
                    className={`
                      flex h-12 w-12 items-center justify-center rounded-full
                      ${badge.unlocked ? 'bg-background' : 'bg-muted'}
                      ${colorClass}
                    `}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-center text-xs font-medium text-muted-foreground">
                    {badge.name}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Additional Stats */}
        <section>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {data?.lessonsCompleted ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Leçons maîtrisées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {data?.weeklyActivity?.reduce((acc, d) => acc + d.cardsStudied, 0) ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Cartes cette semaine</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
