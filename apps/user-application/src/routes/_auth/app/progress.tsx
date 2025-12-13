import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
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
import { AppHeader, BottomNav } from '@/components/main'
import { LogoLoader } from '@/components/ui/logo-loader'
import { getProgressStats } from '@/core/functions/progress'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/app/progress')({
  component: ProgressPage,
})

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
  useEffect(() => {
    const endTracking = trackRouteLoad('app-progress')
    return endTracking
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['progress-stats'],
    queryFn: () => getProgressStats(),
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LogoLoader />
      </div>
    )
  }

  const maxWeeklyValue = Math.max(
    ...((data?.weeklyActivity ?? []).map(d => d.cardsStudied)),
    1,
  )

  const stats = [
    {
      label: 'Cartes',
      value: data?.totalCardsStudied.toLocaleString() ?? '0',
      subValue: `Sur ${data?.totalCardsAvailable.toLocaleString() ?? '0'}`,
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Points XP',
      value: data?.totalXP.toLocaleString() ?? '0',
      subValue: `Top ${100 - (data?.rankPercentage ?? 0)}%`,
      icon: Trophy,
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Série',
      value: `${data?.currentStreak ?? 0}`,
      subValue: 'Jours consécutifs',
      icon: Flame,
      gradient: 'from-red-500 to-rose-600',
    },
    {
      label: 'Temps',
      value: `${data?.totalStudyTimeHours ?? 0}h`,
      subValue: 'Ce mois',
      icon: Clock,
      gradient: 'from-emerald-500 to-green-600',
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Ambient Background - Green/Teal for "Growth" */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[120px]" />
      </div>

      <AppHeader title="Mes Progrès" showAvatar={false} className="bg-transparent/0 border-none" />

      <main className="relative z-10 mx-auto max-w-lg px-5 pt-2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">Statistiques en temps réel</span>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-b from-foreground to-muted-foreground">
              Continue sur ta lancée !
            </h2>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            {stats.map(stat => (
              <div key={generateUUID()} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 backdrop-blur-md">
                <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-linear-to-br', stat.gradient)} />
                <div className="flex flex-col gap-2">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-linear-to-br shadow-lg', stat.gradient)}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                    <div className="text-[10px] text-muted-foreground/80 mt-1">{stat.subValue}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Weekly Chart */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Activité Hebdomadaire
            </h3>
            <div className="rounded-3xl border border-border bg-card p-5 backdrop-blur-xl">
              <div className="flex h-40 items-end justify-between gap-2 md:gap-4">
                {(data?.weeklyActivity ?? []).map((dayData, i) => {
                  const height = maxWeeklyValue > 0 ? (dayData.cardsStudied / maxWeeklyValue) * 100 : 0
                  const isToday = i === (data?.weeklyActivity?.length ?? 0) - 1 // Assuming last item is today

                  return (
                    <div key={`${dayData.date}-${generateUUID()}`} className="flex flex-1 flex-col items-center gap-2 group">
                      {dayData.cardsStudied > 0 && (
                        <div className="mb-1 text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6">
                          {dayData.cardsStudied}
                        </div>
                      )}
                      <div className="relative w-full rounded-t-lg bg-muted h-32 flex items-end overflow-hidden">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 5)}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                          className={cn(
                            'w-full rounded-t-lg relative',
                            isToday ? 'bg-emerald-500' : 'bg-emerald-500/50',
                          )}
                        >
                          {isToday && <div className="absolute inset-0 bg-linear-to-t from-emerald-600 to-emerald-400 opacity-50 blur-sm" />}
                        </motion.div>
                      </div>
                      <span className={cn(
                        'text-xs font-medium',
                        isToday ? 'text-foreground font-bold' : 'text-muted-foreground',
                      )}
                      >
                        {dayData.day.substring(0, 3)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Achievements Grid */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Badges
              </h3>
              <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {data?.unlockedCount ?? 0}
                /
                {data?.totalAchievements ?? 0}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {(data?.achievements ?? []).map((badge) => {
                const Icon = iconMap[badge.icon] ?? Award
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      'aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl border p-2 transition-all',
                      badge.unlocked
                        ? 'border-emerald-500/20 bg-emerald-500/10'
                        : 'border-border bg-card grayscale opacity-60',
                    )}
                  >
                    <Icon className={cn(
                      'h-6 w-6 mb-1',
                      badge.unlocked ? 'text-emerald-500' : 'text-muted-foreground',
                    )}
                    />
                    {badge.unlocked && (
                      <div className="h-1 w-1 rounded-full bg-emerald-400" />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
