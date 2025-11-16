import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
  Check,
  Clock,
  CloudUpload,
  Home,
  RotateCcw,
  Target,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { getMutationQueueManager } from '@/lib/mutation-queue'
import { trackRouteLoad } from '@/lib/performance-monitor'

interface SearchParams {
  correct?: number
  incorrect?: number
  total?: number
  duration?: number
  mode?: string
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
    }
  },
})

function SummaryPage() {
  const { lessonId } = useParams({ from: '/_auth/app/lesson-summary/$lessonId' })
  const { correct, incorrect, total, duration, mode } = useSearch({
    from: '/_auth/app/lesson-summary/$lessonId',
  })
  const navigate = useNavigate()

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
  let performanceLevel = 'Bon travail!'
  let performanceColor = 'text-info'
  let performanceIcon = Target

  if (score >= 90) {
    performanceLevel = 'Excellent!'
    performanceColor = 'text-success'
    performanceIcon = Trophy
  }
  else if (score >= 70) {
    performanceLevel = 'Très bien!'
    performanceColor = 'text-level'
    performanceIcon = TrendingUp
  }
  else if (score < 50) {
    performanceLevel = 'Continue à pratiquer'
    performanceColor = 'text-warning'
  }

  const PerformanceIcon = performanceIcon

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Résumé" showAvatar={false} />

      <main className="mx-auto max-w-lg space-y-6 px-6 py-8 pb-24">
        {/* Performance Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="space-y-6 text-center"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`
                bg-gradient-level flex h-28 w-28 items-center justify-center
                rounded-full shadow-xl
              `}
            >
              <PerformanceIcon className="h-14 w-14 text-white" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h2 className={`
              text-3xl font-bold
              ${performanceColor}
            `}
            >
              {performanceLevel}
            </h2>
            <p className="text-base text-muted-foreground">Session terminée</p>
          </div>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-2 p-0">
            <CardHeader className="bg-gradient-level pb-8 pt-8 text-white">
              <CardTitle className="text-center text-5xl font-bold">
                {score}
                %
              </CardTitle>
              <p className="text-center text-base opacity-90">Score final</p>
            </CardHeader>
            <CardContent className="px-6 py-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3 text-center">
                  <div className={`
                    bg-gradient-success mx-auto flex h-16 w-16 items-center
                    justify-center rounded-full shadow-lg
                  `}
                  >
                    <Check className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{correct}</div>
                    <div className="text-sm text-muted-foreground">Correctes</div>
                  </div>
                </div>
                <div className="space-y-3 text-center">
                  <div className={`
                    bg-gradient-error mx-auto flex h-16 w-16 items-center
                    justify-center rounded-full shadow-lg
                  `}
                  >
                    <X className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{incorrect}</div>
                    <div className="text-sm text-muted-foreground">Incorrectes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="border-2">
            <CardContent className="px-4 py-6 text-center">
              <div className="bg-info mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold">
                {minutes}
                :
                {seconds.toString().padStart(2, '0')}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Temps total</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="px-4 py-6 text-center">
              <div className="bg-info mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{total}</div>
              <div className="mt-1 text-sm text-muted-foreground">Cartes vues</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* XP Earned */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <Card className="overflow-hidden border-2 border-xp bg-gradient-xp-horizontal shadow-xl">
            <CardContent className="px-6 py-8 text-center">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-2 text-5xl font-bold text-white"
              >
                +
                {(correct ?? 0) * 10}
                {' '}
                XP
              </motion.div>
              <div className="text-base text-white/90">Points d'expérience gagnés 🎉</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sync Status - Show if offline or has pending mutations */}
        {(!isOnline || pendingMutations > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="border-2 border-info/50 bg-info/5">
              <CardContent className="flex items-center gap-3 px-4 py-4">
                <div className="bg-info flex h-10 w-10 items-center justify-center rounded-full">
                  <CloudUpload className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {isOnline ? 'Synchronisation en cours...' : 'En attente de connexion'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pendingMutations > 0
                      ? `${pendingMutations} action${pendingMutations > 1 ? 's' : ''} en attente`
                      : 'Vos progrès seront synchronisés automatiquement'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Motivational Message */}
        {score >= 70 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl bg-success/10 p-4 text-center"
          >
            <p className="text-sm font-medium text-success">
              {score >= 90
                ? '🌟 Performance exceptionnelle ! Tu es sur la bonne voie !'
                : '💪 Très bon travail ! Continue comme ça !'}
            </p>
          </motion.div>
        )}

        {score < 50 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl bg-warning/10 p-4 text-center"
          >
            <p className="text-sm font-medium text-warning">
              📚 N'abandonne pas ! La pratique rend parfait. Essaie encore !
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 pt-2"
        >
          <Button
            size="lg"
            className="w-full bg-gradient-xp text-lg font-semibold shadow-lg"
            onClick={() =>
              navigate({
                to: '/app/lesson-session/$lessonId',
                params: { lessonId },
                search: { mode: mode as 'flashcards' | 'quiz' | 'exam' },
              })}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Recommencer
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full border-2"
            onClick={() => navigate({ to: '/app' })}
          >
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Button>
        </motion.div>
      </main>
    </div>
  )
}
