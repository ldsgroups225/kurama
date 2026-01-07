import { useQuery } from '@tanstack/react-query'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import {
  BookOpen,
  Brain,
  ChevronRight,
  FileText,
  Flame,
  Gamepad2,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'

import { motion } from 'motion/react'
import { useEffect } from 'react'
import { LeaderboardWidget, StreakCalendar } from '@/components/gamification'
import { AppHeader, BottomNav } from '@/components/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDailyChallengeStatus } from '@/core/functions/daily-challenge'
import { getDashboardStats } from '@/core/functions/dashboard'
import { getReviewCardsCount } from '@/core/functions/review'
import { authClient, isSigningOut } from '@/lib/auth-client'
import { Rocket } from '@/lib/icons'

import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn, isDefined } from '@/lib/utils'
import { getXPRateText } from '@/lib/xp-rates'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createLazyFileRoute('/_auth/app/')({
  component: AppHome,
})

function AppHome() {
  const navigate = useNavigate()
  const session = authClient.useSession()
  const userId = session.data?.user?.id

  useEffect(() => {
    const endTracking = trackRouteLoad('app-dashboard')
    return endTracking
  }, [])

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-stats', userId],
    queryFn: () => getDashboardStats(),
    enabled: !!userId && !isSigningOut(),
  })

  const { data: dailyChallengeData, isLoading: isDailyChallengeLoading } = useQuery({
    queryKey: ['daily-challenge-status', userId],
    queryFn: () => getDailyChallengeStatus(),
    enabled: !!userId && !isSigningOut(),
  })

  const { data: reviewCountData } = useQuery({
    queryKey: ['review-cards-count', userId],
    queryFn: () => getReviewCardsCount(),
    enabled: !!userId && !isSigningOut(),
  })

  const userLevel = {
    level: Math.floor((dashboardData?.totalXP ?? 0) / 500) + 1,
    currentXP: (dashboardData?.totalXP ?? 0) % 500,
    nextLevelXP: 500,
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const reviewCount = reviewCountData?.count ?? 0

  const quickActions = [
    {
      icon: Brain,
      label: 'Révision',
      subLabel: reviewCount > 0 ? `${reviewCount} carte${reviewCount > 1 ? 's' : ''}` : getXPRateText('quick-review'),
      color: 'from-violet-500 to-fuchsia-500',
      action: () => navigate({ to: '/app/quick-review' }),
      badge: reviewCount > 0 ? reviewCount : undefined,
    },
    {
      icon: Gamepad2,
      label: 'Quiz',
      subLabel: getXPRateText('quiz'),
      color: 'from-amber-400 to-orange-500',
      action: () => navigate({ to: '/app/subjects' }),
    },
    {
      icon: FileText,
      label: 'Examen',
      subLabel: getXPRateText('exam'),
      color: 'from-blue-400 to-cyan-500',
      action: () => navigate({ to: '/app/subjects' }),
    },
    {
      icon: Trophy,
      label: 'Classement',
      subLabel: 'Top 10',
      color: 'from-emerald-400 to-green-500',
      action: () => navigate({ to: '/app/progress' }),
    },
  ]

  const stats = [
    {
      label: 'Série',
      value: `${dashboardData?.currentStreak ?? 0}`,
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      glow: 'shadow-glow-orange',
    },
    {
      label: 'XP',
      value: `${dashboardData?.totalXP ?? 0}`,
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      glow: 'shadow-glow-yellow',
    },
    {
      label: 'Cartes',
      value: `${dashboardData?.totalCardsStudied ?? 0}`,
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      glow: 'shadow-glow-blue',
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[80%] h-[40%] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      <AppHeader
        variant="hero"
        showLevel
        userLevel={userLevel}
      />

      <main className="relative z-10 px-5 pt-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >

          {/* Quick Stats Grid */}
          <motion.section variants={itemVariants} className="grid grid-cols-3 gap-3">
            {stats.map(stat => (
              <div
                key={generateUUID()}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-3 flex flex-col items-center justify-center gap-2 backdrop-blur-md transition-all hover:bg-accent',
                  stat.bg,
                  stat.borderColor,
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 duration-300',
                  stat.bg,
                  stat.borderColor,
                  stat.color,
                  stat.glow,
                  'border shadow-sm',
                )}
                >
                  <stat.icon className={cn('w-5 h-5 fill-current/20')} />
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-foreground leading-none">{stat.value}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </motion.section>

          {/* Daily Challenge Card - Featured */}
          <motion.section variants={itemVariants}>
            <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-1 backdrop-blur-xl transition-all hover:bg-accent">
              <div className="p-6 relative overflow-hidden rounded-[20px]">
                <div className="absolute inset-0 bg-linear-to-br from-violet-600/10 to-transparent opacity-50 transition-opacity group-hover:opacity-100 pointer-events-none" />
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20">
                        <Trophy className="w-3 h-3 mr-1" />
                        Défi du jour
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {dailyChallengeData?.isCompleted ? 'Défi Complété !' : 'Boostez votre savoir'}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[90%]">
                      {dailyChallengeData?.isCompleted
                        ? 'Revenez demain pour gagner plus de récompenses.'
                        : `Complétez ${dailyChallengeData?.totalCards ?? 10} cartes pour gagner un bonus d'XP !`}
                    </p>
                  </div>
                  <div className="relative">
                    {dailyChallengeData && !dailyChallengeData.isCompleted && (
                      <div className="flex flex-col items-end animate-pulse">
                        <div className="flex items-center gap-1 text-xs font-mono text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg border border-orange-400/20">
                          <Timer className="w-3 h-3" />
                          <span className="flex flex-row truncate">
                            {Math.floor(dailyChallengeData.timeUntilReset / 3600)}
                            h
                            {' '}
                            {Math.floor((dailyChallengeData.timeUntilReset % 3600) / 60)}
                            m
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => navigate({ to: '/app/daily-challenge' })}
                    disabled={isDailyChallengeLoading || dailyChallengeData?.isCompleted}
                    className="w-full bg-violet-600 text-white hover:bg-violet-700 font-bold rounded-xl h-12 shadow-lg shadow-violet-500/10 active:scale-95 transition-all text-sm uppercase tracking-wide"
                  >
                    {dailyChallengeData?.isCompleted ? 'À demain !' : 'Commencer le défi'}
                    {!dailyChallengeData?.isCompleted && <ChevronRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Quick Actions Grid */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Rocket className="w-5 h-5 text-indigo-400" />
                Démarrage Rapide
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(action => (
                <button
                  type="button"
                  key={generateUUID()}
                  onClick={action.action}
                  className="group relative flex flex-col p-4 rounded-2xl border border-border bg-card backdrop-blur-md transition-all hover:bg-accent hover:scale-[1.02] active:scale-95 text-left overflow-hidden"
                >
                  <div className={cn(
                    'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-linear-to-br',
                    action.color,
                  )}
                  />

                  <div className="relative">
                    <div className={cn(
                      'w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-linear-to-br shadow-lg',
                      action.color,
                    )}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    {'badge' in action && action.badge && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-violet-500 text-white text-[10px] font-bold shadow-lg">
                        {action.badge > 99 ? '99+' : action.badge}
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-foreground/90">{action.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{action.subLabel}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Recent Activity */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Activité Récente
              </h2>
              <button type="button" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wide">
                Voir tout
              </button>
            </div>

            <div className="space-y-3">
              {dashboardData?.recentSessions?.length
                ? (
                    dashboardData.recentSessions.map((session, i) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-accent backdrop-blur-md transition-all hover:border-accent-foreground/10"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-muted flex items-center justify-center border border-border group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-colors">
                          <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-foreground truncate pr-2">
                            {session.lessonTitle}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{session.subjectName}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-400" />
                            <span>
                              {session.cardsReviewed}
                              {' '}
                              cartes
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg border border-border">
                          {new Date(session.startedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                      </motion.div>
                    ))
                  )
                : (
                    <div className="text-center py-10 text-sm text-muted-foreground bg-muted/50 rounded-3xl border border-border border-dashed">
                      <div className="mb-2">👻</div>
                      Aucune activité récente.
                    </div>
                  )}
            </div>
          </motion.section>

          {/* Gamification Modules (Streak & Leaderboard) */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4">
            {/* Streamlined Steak Calendar */}
            <StreakCalendar
              currentStreak={dashboardData?.currentStreak ?? 0}
              longestStreak={dashboardData?.longestStreak ?? 0}
              streakHistory={
                dashboardData?.streakHistory?.filter(isDefined).map(date => ({
                  date: new Date(date),
                  completed: true,
                })) ?? []
              }
            />

            {/* Leaderboard Widget */}
            <LeaderboardWidget
              entries={dashboardData?.leaderboard ?? []}
              currentUserId={userId}
              variant="compact"
              onViewAll={() => navigate({ to: '/app/progress' })}
            />
          </motion.section>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}
