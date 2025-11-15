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
import { trackRouteLoad } from '@/lib/performance-monitor'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/app/progress')({
  component: ProgressPage,
})

function ProgressPage() {
  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-progress')
    return endTracking
  }, [])

  const stats = [
    {
      icon: BookOpen,
      label: 'Total Cartes',
      value: '1,247',
      subValue: 'Sur 5,000',
      color: 'text-xp',
      progress: 25,
    },
    {
      icon: Trophy,
      label: 'Points',
      value: '8,450',
      subValue: 'Top 15%',
      color: 'text-level',
      progress: 85,
    },
    {
      icon: Flame,
      label: 'Série',
      value: '12 jours',
      subValue: 'Record: 28',
      color: 'text-streak',
      progress: 43,
    },
    {
      icon: Clock,
      label: 'Temps Total',
      value: '24h',
      subValue: 'Ce mois',
      color: 'text-success',
      progress: 60,
    },
  ]

  const weeklyData = [
    { day: 'L', value: 85 },
    { day: 'M', value: 92 },
    { day: 'M', value: 78 },
    { day: 'J', value: 95 },
    { day: 'V', value: 88 },
    { day: 'S', value: 70 },
    { day: 'D', value: 65 },
  ]

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
                {weeklyData.map(data => (
                  <div
                    key={generateUUID()}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div className={`
                      relative w-full overflow-hidden rounded-t-lg bg-muted
                    `}
                    >
                      <div
                        className={`
                          w-full rounded-t-lg bg-primary transition-all
                          duration-500
                        `}
                        style={{ height: `${data.value}px` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Badges Débloqués</h2>
            <span className="text-sm text-muted-foreground">5/20</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Award, label: 'Débutant', unlocked: true, color: 'text-level' },
              { icon: Flame, label: 'Série 7j', unlocked: true, color: 'text-streak' },
              { icon: Target, label: '100 Cartes', unlocked: true, color: 'text-xp' },
              { icon: TrendingUp, label: 'Progrès', unlocked: true, color: 'text-success' },
              { icon: Calendar, label: 'Régulier', unlocked: true, color: 'text-epic' },
              { icon: Trophy, label: 'Expert', unlocked: false, color: 'text-muted-foreground' },
              { icon: BookOpen, label: 'Lecteur', unlocked: false, color: 'text-muted-foreground' },
              { icon: Award, label: 'Champion', unlocked: false, color: 'text-muted-foreground' },
            ].map((badge) => {
              const Icon = badge.icon
              return (
                <div
                  key={generateUUID()}
                  className={`
                    flex flex-col items-center gap-2 rounded-xl p-3
                    ${badge.unlocked
                  ? `bg-muted`
                  : `bg-muted/30`
                }
                  `}
                >
                  <div className={`
                    flex h-12 w-12 items-center justify-center rounded-full
                    ${badge.unlocked
                  ? `bg-background`
                  : `bg-muted`
                }
                    ${badge.color}
                  `}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`
                    text-center text-xs font-medium text-muted-foreground
                  `}
                  >
                    {badge.label}
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
