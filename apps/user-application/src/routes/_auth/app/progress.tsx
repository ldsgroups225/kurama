import type { AchievementWithProgress } from '@kurama/data-ops/queries/achievements'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Award,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarCheck,
  Check,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
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

// Shared rarity configuration using semantic colors
const rarityGradientMap = {
  common: 'bg-gradient-common',
  rare: 'bg-gradient-rare',
  epic: 'bg-gradient-epic',
  legendary: 'bg-gradient-legendary',
} as const

const rarityBgMap = {
  common: 'bg-common border-common',
  rare: 'bg-rare border-rare',
  epic: 'bg-epic border-epic',
  legendary: 'bg-legendary border-legendary',
} as const

const rarityLabelMap = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
} as const

function ProgressPage() {
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<AchievementWithProgress[]>([])
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithProgress | null>(null)

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

  // Handle newly unlocked achievements with localStorage filtering
  useEffect(() => {
    if (data?.newlyUnlocked && data.newlyUnlocked.length > 0 && userId) {
      const storageKey = `seen_achievements_${userId}`

      try {
        // Read previously seen achievements
        const stored = localStorage.getItem(storageKey)
        const seenIds = new Set(stored ? JSON.parse(stored) : [])

        // Filter out achievements that have been seen
        const trulyNew = data.newlyUnlocked.filter(a => !seenIds.has(a.id))

        if (trulyNew.length > 0) {
          setNewlyUnlockedAchievements(trulyNew)

          // Update localStorage immediately to mark these as seen
          const updatedSeenIds = [...Array.from(seenIds), ...trulyNew.map(a => a.id)]
          localStorage.setItem(storageKey, JSON.stringify(updatedSeenIds))
        }
      }
      catch (error) {
        console.error('Error accessing localStorage for achievements:', error)
        // Fallback: show them all if storage fails
        setNewlyUnlockedAchievements(data.newlyUnlocked)
      }
    }
  }, [data?.newlyUnlocked, userId])

  const handleDismissAchievements = (achievementIds: string[]) => {
    setNewlyUnlockedAchievements([])
    // TODO: Call markAchievementsNotified API
    console.warn('Marking achievements as notified:', achievementIds)
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

          {/* Leaderboard */}
          <motion.div variants={itemVariants}>
            <LeaderboardWidget
              entries={data?.leaderboard ?? []}
              currentUserId={userId}
              title="Classement"
            />
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

            <div className="grid grid-cols-3 gap-2">
              {(data?.achievements ?? []).map((achievement) => {
                const Icon = iconMap[achievement.icon] ?? Award
                const isNewlyUnlocked = data?.newlyUnlocked?.some(a => a.id === achievement.id)

                const gradient = rarityGradientMap[achievement.rarity]
                const bgStyle = rarityBgMap[achievement.rarity]

                const handleClick = () => setSelectedAchievement(achievement)
                const handleKeyDown = (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedAchievement(achievement)
                  }
                }

                return (
                  <motion.div
                    key={achievement.id}
                    initial={isNewlyUnlocked ? { scale: 0.8, opacity: 0 } : false}
                    animate={isNewlyUnlocked ? { scale: 1, opacity: 1 } : false}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    role="button"
                    tabIndex={0}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    aria-label={`Voir les détails du badge ${achievement.name}`}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className={cn(
                      'relative flex flex-col items-center justify-center gap-2 rounded-xl border p-3 aspect-square transition-all overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary',
                      achievement.unlocked
                        ? cn('backdrop-blur-md shadow-lg', bgStyle)
                        : 'border-border/30 bg-muted/10',
                    )}
                  >
                    {/* Dynamic Background Glow for Unlocked */}
                    {achievement.unlocked && (
                      <div className={cn(
                        'absolute inset-0 opacity-30',
                        gradient,
                      )}
                      />
                    )}

                    {/* Rarity Pill (Tiny) */}
                    {achievement.unlocked && achievement.rarity !== 'common' && (
                      <div className={cn(
                        'absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full shadow-sm',
                        gradient,
                      )}
                      />
                    )}

                    {/* Icon */}
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center relative z-10 shadow-md',
                      achievement.unlocked
                        ? cn(gradient, 'text-white')
                        : 'bg-muted/30 text-muted-foreground/50',
                    )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Name */}
                    <div className="z-10 w-full text-center">
                      <span className={cn(
                        'text-[10px] sm:text-xs font-bold leading-tight line-clamp-2',
                        achievement.unlocked ? 'text-foreground drop-shadow-sm' : 'text-muted-foreground/70',
                      )}
                      >
                        {achievement.name}
                      </span>
                    </div>

                    {/* Progress (Locked only) */}
                    {!achievement.unlocked && (
                      <div className="w-full mt-auto pt-1">
                        <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/40 rounded-full"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stars/Sparkles for Legendary */}
                    {achievement.unlocked && achievement.rarity === 'legendary' && (
                      <>
                        <Sparkles className="absolute top-1 left-1 w-3 h-3 text-legendary opacity-50 animate-pulse" />
                        <Sparkles className="absolute bottom-2 right-2 w-2 h-2 text-legendary opacity-30 animate-pulse delay-700" />
                      </>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav />

      {/* Achievement Details Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={open => !open && setSelectedAchievement(null)}>
        <DialogContent className="sm:max-w-md bg-card backdrop-blur-xl border-border p-0 overflow-hidden text-foreground">
          {selectedAchievement && (() => {
            const Icon = iconMap[selectedAchievement.icon] ?? Award
            const gradient = rarityGradientMap[selectedAchievement.rarity] || rarityGradientMap.common

            return (
              <div className="flex flex-col relative">
                {/* Header / Banner */}
                <div className={cn('relative h-32 w-full overflow-hidden opacity-20', gradient)}>
                  <div className="absolute inset-0 bg-linear-to-t from-card to-transparent" />
                </div>

                <div className="px-6 pb-6 -mt-12 relative z-10 flex flex-col items-center text-center gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-black/50 mx-auto',
                    selectedAchievement.unlocked ? gradient : 'bg-muted grayscale opacity-50',
                  )}
                  >
                    <Icon className="w-10 h-10 text-white drop-shadow-md" />
                  </div>

                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-bold">{selectedAchievement.name}</DialogTitle>
                    <div className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-transparent',
                      'bg-muted text-muted-foreground uppercase tracking-wider',
                    )}
                    >
                      {rarityLabelMap[selectedAchievement.rarity]}
                    </div>
                  </div>

                  <DialogDescription className="text-muted-foreground text-base max-w-xs mx-auto">
                    {selectedAchievement.description}
                  </DialogDescription>

                  {/* Footer / Status */}
                  <div className="w-full mt-4 pt-4 border-t border-border">
                    {selectedAchievement.unlocked
                      ? (
                          <div className="flex items-center justify-center gap-2 text-success font-medium">
                            <Check className="w-5 h-5" />
                            <span>Badge débloqué</span>
                          </div>
                        )
                      : (
                          <div className="space-y-2 w-full">
                            <div className="flex justify-between text-xs text-muted-foreground uppercase font-bold tracking-wider">
                              <span>Progression</span>
                              <span>
                                {selectedAchievement.progress}
                                {' '}
                                /
                                {' '}
                                {selectedAchievement.maxProgress}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                  </div>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Achievement unlock toast */}
      <AchievementUnlockToast
        achievements={newlyUnlockedAchievements}
        onDismiss={handleDismissAchievements}
      />
    </div>
  )
}
