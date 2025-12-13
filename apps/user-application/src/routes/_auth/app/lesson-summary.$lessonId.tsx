import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
  Check,
  Clock,
  CloudUpload,
  Home,
  RotateCcw,
  Share2,
  Target,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { EnhancedXPDisplay } from '@/components/gamification'
import { AppHeader } from '@/components/main'
import { Button } from '@/components/ui/button'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { getMutationQueueManager } from '@/lib/mutation-queue'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'

interface SearchParams {
  correct?: number
  incorrect?: number
  total?: number
  duration?: number
  mode?: string
  xpEarned?: number
  leveledUp?: string
  newLevel?: number
}

export const Route = createFileRoute('/_auth/app/lesson-summary/$lessonId')({
  component: SummaryPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      correct: Number(search.correct) || 0,
      incorrect: Number(search.incorrect) || 0,
      total: Number(search.total) || 0,
      duration: Number(search.duration) || 0,
      mode: (search.mode as string) || 'flashcards',
      xpEarned: search.xpEarned ? Number(search.xpEarned) : undefined,
      leveledUp: search.leveledUp as string | undefined,
      newLevel: search.newLevel ? Number(search.newLevel) : undefined,
    }
  },
})

function SummaryPage() {
  const { lessonId } = useParams({ from: '/_auth/app/lesson-summary/$lessonId' })
  const { correct, incorrect, total, duration, mode, xpEarned, leveledUp, newLevel } = useSearch({
    from: '/_auth/app/lesson-summary/$lessonId',
  })
  const navigate = useNavigate()

  // Calculate actual XP (use server-provided value or fallback to estimate)
  const actualXpEarned = xpEarned ?? (correct ?? 0) * 10
  const didLevelUp = leveledUp === 'true'

  // Offline support
  const { isOnline } = useOnlineStatus()
  const [pendingMutations, setPendingMutations] = useState(0)

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-summary')
    return endTracking
  }, [])

  // Track pending mutations count
  useEffect(() => {
    const updatePendingCount = async () => {
      const queueManager = getMutationQueueManager()
      const count = await queueManager.getPendingCount()
      setPendingMutations(count)
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000)

    return () => clearInterval(interval)
  }, [])

  const score = (total ?? 0) > 0 ? Math.round(((correct ?? 0) / (total ?? 1)) * 100) : 0
  const minutes = Math.floor((duration ?? 0) / 60)
  const seconds = (duration ?? 0) % 60

  // Determine performance level
  let performanceLevel = 'Bon travail !'
  let performanceColor = 'text-white'
  let gradientClass = 'from-blue-500 to-cyan-500'

  if (score >= 90) {
    performanceLevel = 'Excellent !'
    performanceColor = 'text-emerald-400'
    gradientClass = 'from-emerald-500 to-teal-500'
    gradientClass = 'from-emerald-500 to-teal-500'
  }
  else if (score >= 70) {
    performanceLevel = 'Très bien !'
    performanceColor = 'text-blue-400'
    gradientClass = 'from-blue-500 to-indigo-500'
  }
  else if (score < 50) {
    performanceLevel = 'Continue à pratiquer'
    performanceColor = 'text-orange-400'
    gradientClass = 'from-orange-500 to-red-500'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden pb-24">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-[10%] left-[50%] -translate-x-1/2 w-[80%] h-[40%] rounded-full opacity-30 blur-[120px] bg-linear-to-r ${gradientClass}`} />
        <div className="absolute bottom-0 left-0 w-full h-[30%] bg-linear-to-t from-background to-transparent z-10" />
      </div>

      <AppHeader title="Résumé" showAvatar={false} className="bg-transparent/0 border-none relative z-20" />

      <main className="relative z-10 mx-auto max-w-lg px-6 pt-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Main Score Circle */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center pt-8 pb-4">
            <div className="relative group">
              <div className={`absolute -inset-1 rounded-full opacity-75 blur-2xl transition duration-1000 group-hover:opacity-100 bg-linear-to-r ${gradientClass}`} />
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-card border-4 border-muted shadow-2xl">
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/70">
                    {score}
                    %
                  </span>
                  <span className="text-sm font-medium text-muted-foreground mt-1">Score Final</span>
                </div>

                {/* Circular Progress (Static for now, could be animated SVG) */}
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="76"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="76"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={477}
                    strokeDashoffset={477 - (477 * score) / 100}
                    className={cn('transition-all duration-1000 ease-out', performanceColor)}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-6 text-center space-y-2">
              <h2 className={cn('text-3xl font-bold tracking-tight', performanceColor)}>
                {performanceLevel}
              </h2>
              <p className="text-muted-foreground font-medium">
                Session terminée •
                {' '}
                {minutes}
                m
                {' '}
                {seconds}
                s
              </p>
            </div>
          </motion.div>

          {/* Enhanced XP Card */}
          <motion.div variants={itemVariants}>
            <EnhancedXPDisplay
              totalXP={actualXpEarned}
              mode={mode as 'flashcards' | 'quiz' | 'exam' | 'quick-review'}
              correctCount={correct ?? 0}
              totalCount={total ?? 0}
              streakDays={7} // TODO: Get actual streak from dashboard data
              hasLevelUp={didLevelUp}
              newLevel={newLevel}
            />
          </motion.div>

          {/* Detailed Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card border border-border p-4 backdrop-blur-md flex flex-col items-center justify-center text-center group transition-colors hover:bg-accent/50">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-2xl font-bold text-foreground">{correct}</span>
              <span className="text-xs font-medium text-emerald-500">Correctes</span>
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 backdrop-blur-md flex flex-col items-center justify-center text-center group transition-colors hover:bg-accent/50">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-2xl font-bold text-foreground">{incorrect}</span>
              <span className="text-xs font-medium text-red-500">Incorrectes</span>
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 backdrop-blur-md flex flex-col items-center justify-center text-center group transition-colors hover:bg-accent/50">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-foreground">{total}</span>
              <span className="text-xs font-medium text-blue-500">Total Cartes</span>
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 backdrop-blur-md flex flex-col items-center justify-center text-center group transition-colors hover:bg-accent/50">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                {minutes}
                :
                {seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-purple-500">Temps</span>
            </div>
          </motion.div>

          {/* Offline Sync Status */}
          {(!isOnline || pendingMutations > 0) && (
            <motion.div variants={itemVariants}>
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 flex items-center gap-3">
                <CloudUpload className="h-5 w-5 text-orange-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-300">
                    {isOnline ? 'Synchronisation...' : 'Mode Hors Ligne'}
                  </p>
                  <p className="text-xs text-orange-400/70">
                    {pendingMutations}
                    {' '}
                    changements en attente
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div variants={itemVariants} className="space-y-3 pt-4">
            <Button
              size="lg"
              className={cn(
                'w-full font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all',
                'bg-linear-to-r hover:opacity-90',
                gradientClass,
              )}
              onClick={() => navigate({
                to: '/app/lesson-session/$lessonId',
                params: { lessonId },
                search: { mode: mode as any },
              })}
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Recommencer la session
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="w-full border border-border bg-card hover:bg-accent text-foreground"
                onClick={() => navigate({ to: '/app' })}
              >
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full border border-border bg-card hover:bg-accent text-foreground"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Kurama App',
                      text: `Je viens de terminer une session avec un score de ${score}% !`,
                      url: window.location.href,
                    }).catch(() => { })
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Partager
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
