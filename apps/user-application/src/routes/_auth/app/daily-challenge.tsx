import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check, Clock, Flame, Loader2, Play, Trophy, X, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { RewardAnimation } from '@/components/gamification'
import { AppHeader } from '@/components/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  completeDailyChallenge,
  getDailyChallengeStatus,
  startDailyChallenge,
} from '@/core/functions/daily-challenge'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/app/daily-challenge')({
  component: DailyChallengePage,
})

type ChallengePhase = 'preview' | 'active' | 'completed'

function DailyChallengePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [phase, setPhase] = useState<ChallengePhase>('preview')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showReward, setShowReward] = useState(false)

  useEffect(() => {
    const endTracking = trackRouteLoad('daily-challenge')
    return endTracking
  }, [])

  const { data: challengeStatus, isLoading } = useQuery({
    queryKey: ['daily-challenge-status'],
    queryFn: () => getDailyChallengeStatus(),
  })

  const startMutation = useMutation({
    mutationFn: () => startDailyChallenge(),
    onSuccess: (result) => {
      setSessionId(result.sessionId ?? null)
      setStartTime(Date.now())
      setPhase('active')
      if (result.resumed && challengeStatus?.progressCount) {
        setCurrentCardIndex(challengeStatus.progressCount)
      }
    },
  })

  const completeMutation = useMutation({
    mutationFn: (data: { sessionId: number, correctCount: number, totalCount: number, duration: number }) =>
      completeDailyChallenge({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-status'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      setShowReward(true)
    },
  })

  const cards = challengeStatus?.cards ?? []
  const currentCard = cards[currentCardIndex]
  const totalCards = cards.length

  const handleStart = useCallback(() => {
    startMutation.mutate()
  }, [startMutation])

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
    }

    if (currentCardIndex === totalCards - 1) {
      // Complete the challenge
      const duration = Math.floor((Date.now() - startTime) / 1000)
      if (sessionId) {
        completeMutation.mutate({
          sessionId,
          correctCount: isCorrect ? correctCount + 1 : correctCount,
          totalCount: totalCards,
          duration,
        })
      }
      setPhase('completed')
    }
    else {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }, [currentCardIndex, totalCards, startTime, sessionId, correctCount, completeMutation])

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev)
  }, [])

  // Format time until reset
  const formatTimeUntilReset = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Défi du Jour" showAvatar={false} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // Already completed today
  if (challengeStatus?.isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Défi du Jour" showAvatar={false} />
        <main className="mx-auto max-w-lg space-y-6 px-4 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-success">
              <Check className="h-12 w-12 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Défi Complété !</h2>
            <p className="text-muted-foreground">Revenez demain pour un nouveau défi</p>
          </motion.div>

          <Card className="border-2">
            <CardContent className="p-6 text-center">
              <div className="mb-4 text-4xl font-bold text-primary">
                {challengeStatus.score}
                %
              </div>
              <div className="mb-4 flex items-center justify-center gap-2 text-xp">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">
                  +
                  {challengeStatus.xpEarned}
                  {' '}
                  XP
                </span>
              </div>
              {challengeStatus.consecutiveDays > 1 && (
                <div className="flex items-center justify-center gap-2 text-streak">
                  <Flame className="h-5 w-5" />
                  <span className="font-medium">
                    {challengeStatus.consecutiveDays}
                    {' '}
                    jours consécutifs
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <Clock className="mr-1 inline h-4 w-4" />
            Prochain défi dans
            {' '}
            {formatTimeUntilReset(challengeStatus.timeUntilReset)}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate({ to: '/app' })}
          >
            Retour à l'accueil
          </Button>
        </main>
      </div>
    )
  }

  // Preview phase
  if (phase === 'preview') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Défi du Jour" showAvatar={false} />
        <main className="mx-auto max-w-lg space-y-6 px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-level">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Défi du Jour</h2>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </motion.div>

          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">{totalCards}</div>
                  <div className="text-sm text-muted-foreground">Cartes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">
                    ~
                    {challengeStatus?.estimatedMinutes}
                  </div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-xp" />
                  <span>Gagnez jusqu'à 150 XP</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flame className="h-4 w-4 text-streak" />
                  <span>Bonus série : +25 XP</span>
                </div>
                {challengeStatus?.consecutiveDays && challengeStatus.consecutiveDays > 0 && (
                  <div className="flex items-center gap-2 text-sm font-medium text-streak">
                    <Flame className="h-4 w-4" />
                    <span>
                      Série actuelle :
                      {challengeStatus.consecutiveDays}
                      {' '}
                      jours
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full bg-gradient-level text-lg font-semibold"
            onClick={handleStart}
            disabled={startMutation.isPending}
          >
            {startMutation.isPending
              ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )
              : (
                  <Play className="mr-2 h-5 w-5" />
                )}
            {challengeStatus?.isInProgress ? 'Reprendre' : 'Commencer'}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate({ to: '/app' })}
          >
            Plus tard
          </Button>
        </main>
      </div>
    )
  }

  // Active phase - exam mode
  if (phase === 'active' && currentCard) {
    const progress = ((currentCardIndex + 1) / totalCards) * 100

    return (
      <div className="min-h-screen bg-background">
        <AppHeader title={`${currentCardIndex + 1}/${totalCards}`} showAvatar={false} />

        <main className="mx-auto max-w-lg px-4 py-6">
          {/* Progress bar */}
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-level"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Card */}
          <div className="perspective-1000 mb-6">
            <motion.div
              className="relative h-64 cursor-pointer"
              onClick={handleFlip}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <Card
                className={cn(
                  'absolute inset-0 flex items-center justify-center border-2 p-6',
                  isFlipped && 'invisible',
                )}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <CardContent className="text-center">
                  <p className="text-lg font-medium">{currentCard.frontContent}</p>
                  <p className="mt-4 text-sm text-muted-foreground">Touchez pour retourner</p>
                </CardContent>
              </Card>

              {/* Back */}
              <Card
                className="absolute inset-0 flex items-center justify-center border-2 p-6"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <CardContent className="text-center">
                  <p className="text-lg font-medium">{currentCard.backContent}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Answer buttons */}
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-error text-error hover:bg-error hover:text-white"
                onClick={() => handleAnswer(false)}
              >
                <X className="mr-2 h-5 w-5" />
                Incorrect
              </Button>
              <Button
                size="lg"
                className="bg-gradient-success"
                onClick={() => handleAnswer(true)}
              >
                <Check className="mr-2 h-5 w-5" />
                Correct
              </Button>
            </motion.div>
          )}
        </main>
      </div>
    )
  }

  // Completed phase
  if (phase === 'completed') {
    const score = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0
    const baseXP = 100
    const scoreBonus = Math.round(score * 0.5)
    const streakBonus = (challengeStatus?.consecutiveDays ?? 0) > 0 ? 25 : 0
    const totalXP = baseXP + scoreBonus + streakBonus

    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Résultats" showAvatar={false} />
        <main className="mx-auto max-w-lg space-y-6 px-4 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-level">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Défi Terminé !</h2>
          </motion.div>

          <Card className="overflow-hidden border-2">
            <CardContent className="p-0">
              <div className="bg-gradient-level p-6 text-center text-white">
                <div className="text-5xl font-bold">
                  {score}
                  %
                </div>
                <div className="text-white/80">Score</div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-success">
                      <Check className="h-6 w-6" />
                      {correctCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-error">
                      <X className="h-6 w-6" />
                      {totalCards - correctCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-xp bg-gradient-xp-horizontal">
            <CardContent className="p-6 text-center text-white">
              <div className="mb-2 text-4xl font-bold">
                +
                {totalXP}
                {' '}
                XP
              </div>
              <div className="space-y-1 text-sm text-white/80">
                <div>
                  Base : +
                  {baseXP}
                  {' '}
                  XP
                </div>
                <div>
                  Bonus score : +
                  {scoreBonus}
                  {' '}
                  XP
                </div>
                {streakBonus > 0 && (
                  <div>
                    Bonus série : +
                    {streakBonus}
                    {' '}
                    XP
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate({ to: '/app' })}
          >
            Retour à l'accueil
          </Button>
        </main>

        {showReward && completeMutation.data && (
          <RewardAnimation
            show={showReward}
            reward={{
              type: 'xp',
              title: 'Défi Complété !',
              description: `Vous avez gagné ${completeMutation.data.xpEarned} XP`,
              value: completeMutation.data.xpEarned,
            }}
            onClose={() => setShowReward(false)}
          />
        )}
      </div>
    )
  }

  return null
}
