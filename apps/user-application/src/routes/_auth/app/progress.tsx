import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Award,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarCheck,
  Clock,
  Crown,
  Eye,
  Flame,
  GraduationCap,
  Library,
  Medal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AchievementUnlockToast, LeaderboardWidget } from '@/components/gamification'
import { AppHeader, BottomNav } from '@/components/main'
import { LogoLoader } from '@/components/ui/logo-loader'
import { getProgressStats } from '@/core/functions/progress'
import { authClient, isSigningOut } from '@/lib/auth-client'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/app/progress')({
  component: ProgressPage,
})

const iconMap: Record<string, typeof Award> = {
  Award,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarCheck,
  Crown,
  Eye,
  Flame,
  GraduationCap,
  Library,
  Medal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
}

// Rarity styling maps
const rarityGradients = {
  common: 'bg-gradient-common',
  rare: 'bg-gradient-rare',
  epic: 'bg-gradient-epic',
  legendary: 'bg-gradient-legendary',
} as const

const rarityBorderColors = {
  common: 'border-zinc-500/20 bg-zinc-500/10',
  rare: 'border-blue-500/20 bg-blue-500/10',
  epic: 'border-purple-500/20 bg-purple-500/10',
  legendary: 'border-amber-500/20 bg-amber-500/10',
} as const

const rarityLabels = {
  common: 'COMMUN',
  rare: 'RARE',
  epic: 'ÉPIQUE',
  legendary: 'LÉGENDAIRE',
} as const

function ProgressPage() {
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<any[]>([])

  useEffect(() => {
    const endTracking = trackRouteLoad('app-progress')
    return endTracking
  }, [])

  const session = authClient.useSession()
  const userId = session.data?.user?.id

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['progress-stats', userId],
    queryFn: () => getProgressStats(),
    enabled: !!userId && !isSigningOut(),
  })

  // Handle newly unlocked achievements
  useEffect(() => {
    if (data?.newlyUnlocked && data.newlyUnlocked.length > 0) {
      setNewlyUnlockedAchievements(data.newlyUnlocked)
    }
  }, [data?.newlyUnlocked])

  const handleDismissAchievements = (achievementIds: string[]) => {
    setNewlyUnlockedAchievements([])
    // TODO: Call markAchievementsNotified API
    console.log('Marking achievements as notified:', achievementIds)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Show loading when session is pending OR query is loading/fetching
  if (session.isPending || isLoading || (isFetching && !data)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LogoLoader />
      </div>
    )
  }

  const maxWeeklyValue = Math.max(
    ...((data?.weeklyActivity ?? []).map(d => d.cardsStudied)),
    0,
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
              <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 backdrop-blur-md">
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
              {/* Chart Legend */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cartes étudiées par jour</span>
                {maxWeeklyValue === 0
                  ? (
                      <span className="text-xs text-muted-foreground">Aucune activité</span>
                    )
                  : (
                      <span className="text-xs text-muted-foreground">
                        Max:
                        {' '}
                        {maxWeeklyValue}
                        {' '}
                        carte
                        {maxWeeklyValue !== 1 ? 's' : ''}
                      </span>
                    )}
              </div>

              <div className="flex h-40 items-end justify-between gap-2 md:gap-4">
                {(data?.weeklyActivity ?? []).map((dayData, i) => {
                  // Calculate height percentage (0-100%)
                  let height = 0
                  if (maxWeeklyValue > 0 && dayData.cardsStudied > 0) {
                    height = (dayData.cardsStudied / maxWeeklyValue) * 100
                  }

                  const isToday = i === (data?.weeklyActivity?.length ?? 0) - 1 // Assuming last item is today
                  const hasActivity = dayData.cardsStudied > 0

                  return (
                    <div key={dayData.date} className="flex flex-1 flex-col items-center gap-2 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {hasActivity ? `${dayData.cardsStudied} carte${dayData.cardsStudied !== 1 ? 's' : ''}` : 'Aucune activité'}
                        </div>
                      </div>
                      <div className="relative w-full h-32 flex items-end overflow-hidden">
                        {hasActivity
                          ? (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(height, 8)}%` }} // Minimum 8% for visibility when there's activity
                                transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                                className={cn(
                                  'w-full rounded-t-lg relative shadow-sm bg-gradient-success',
                                  isToday && 'shadow-[0_0_10px_var(--success-from)]',
                                )}
                              />
                            )
                          : (
                            // Empty state - subtle indicator at bottom
                              <div className="w-full h-1 rounded-full bg-muted/30" />
                            )}
                      </div>
                      <span className={cn(
                        'text-xs font-medium',
                        isToday ? 'text-foreground font-bold' : 'text-muted-foreground',
                      )}
                      >
                        {dayData.day}
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

            <div className="grid grid-cols-2 gap-3">
              {(data?.achievements ?? []).map((achievement) => {
                const Icon = iconMap[achievement.icon] ?? Award
                const isNewlyUnlocked = data?.newlyUnlocked?.some(a => a.id === achievement.id)

                return (
                  <motion.div
                    key={achievement.id}
                    initial={isNewlyUnlocked ? { scale: 0.8, opacity: 0 } : false}
                    animate={isNewlyUnlocked ? { scale: 1, opacity: 1 } : false}
                    transition={isNewlyUnlocked ? { duration: 0.5, ease: 'backOut' } : undefined}
                    className={cn(
                      'relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all',
                      achievement.unlocked
                        ? rarityBorderColors[achievement.rarity]
                        : 'border-border bg-card opacity-60',
                    )}
                  >
                    {/* Rarity indicator */}
                    {achievement.unlocked && achievement.rarity !== 'common' && (
                      <div className={cn(
                        'absolute -top-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white',
                        rarityGradients[achievement.rarity],
                      )}
                      >
                        {rarityLabels[achievement.rarity]}
                      </div>
                    )}

                    {/* Icon */}
                    <div className={cn(
                      'h-12 w-12 rounded-full flex items-center justify-center',
                      achievement.unlocked
                        ? rarityGradients[achievement.rarity]
                        : 'bg-muted',
                    )}
                    >
                      <Icon className={cn(
                        'h-6 w-6',
                        achievement.unlocked ? 'text-white' : 'text-muted-foreground',
                      )}
                      />
                    </div>

                    {/* Name */}
                    <span className="text-xs font-semibold text-center">
                      {achievement.name}
                    </span>

                    {/* Description */}
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {achievement.description}
                    </span>

                    {/* Progress bar (for locked) */}
                    {!achievement.unlocked && (
                      <div className="w-full mt-1">
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-muted-foreground/50 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {achievement.progress}
                          /
                          {achievement.maxProgress}
                        </span>
                      </div>
                    )}

                    {/* Unlock indicator */}
                    {achievement.unlocked && (
                      <motion.div
                        initial={isNewlyUnlocked ? { scale: 0 } : { scale: 1 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.3, ease: 'backOut' }}
                        className={cn(
                          'h-2 w-2 rounded-full',
                          rarityGradients[achievement.rarity],
                        )}
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div variants={itemVariants}>
            <LeaderboardWidget
              entries={data?.leaderboard ?? []}
              currentUserId={userId}
              title="Classement"
            />
          </motion.div>
        </motion.div>
      </main>

      <BottomNav />

      {/* Achievement unlock toast */}
      <AchievementUnlockToast
        achievements={newlyUnlockedAchievements}
        onDismiss={handleDismissAchievements}
      />
    </div>
  )
}
