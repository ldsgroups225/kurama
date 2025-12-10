import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check, Clock, Flame, Loader2, Play, Timer, Trophy, X, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RewardAnimation } from '@/components/gamification'
import { Test } from '@/components/learning/test'
import { TestLoading } from '@/components/learning/test-loading'
import { AppHeader } from '@/components/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogoLoader } from '@/components/ui/logo-loader'
import { Progress } from '@/components/ui/progress'
import {
  completeDailyChallenge,
  getDailyChallengeStatus,
  startDailyChallenge,
} from '@/core/functions/daily-challenge'
import { trackRouteLoad } from '@/lib/performance-monitor'

export const Route = createFileRoute('/_auth/app/daily-challenge')({
  component: DailyChallengePage,
})

type ChallengePhase = 'preview' | 'active' | 'completed'

// Time limit in seconds (10 minutes)
const TIME_LIMIT = 10 * 60

function DailyChallengePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [phase, setPhase] = useState<ChallengePhase>('preview')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [showReward, setShowReward] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT)
  const timeUpHandledRef = useRef(false)

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
      setTimeRemaining(TIME_LIMIT)
      setPhase('active')
      if (result.resumed && challengeStatus?.progressCount) {
        setCurrentCardIndex(challengeStatus.progressCount)
      }
    },
  })

  const completeMutation = useMutation({
    mutationFn: (data: {
      sessionId: number
      correctCount: number
      totalCount: number
      duration: number
    }) => completeDailyChallenge({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-status'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      setShowReward(true)
    },
  })

  const cards = useMemo(() => challengeStatus?.cards ?? [], [challengeStatus?.cards])
  const totalCards = cards.length

  // Store generated test questions
  const [testQuestions, setTestQuestions] = useState<
    Array<{
      id: number
      frontContent: string
      backContent: string
      cardType: string
      difficulty: number
      lessonId: number
      questionType: 'multiple-choice' | 'true-false'
      question?: string
      options?: Array<{ id: string, text: string, isCorrect: boolean }>
      correctAnswer?: string
    }>
  >([])

  const currentQuestion = testQuestions[currentCardIndex]

  // Generate test questions (called on start)
  const generateTestQuestions = useCallback(() => {
    if (cards.length === 0)
      return []

    return cards.map((card, index) => {
      const questionType: 'multiple-choice' | 'true-false'
        = index % 2 === 0 ? 'multiple-choice' : 'true-false'

      if (questionType === 'multiple-choice') {
        const correctAnswer = card.backContent
        const otherCards = cards.filter((_, i) => i !== index)
        const shuffledOthers = [...otherCards].sort((a, b) => {
          const hashA = (a.id * 31 + index) % 1000
          const hashB = (b.id * 31 + index) % 1000
          return hashA - hashB
        })
        const wrongAnswers = shuffledOthers.slice(0, 3).map(c => c.backContent)

        const options = [
          { id: 'correct', text: correctAnswer, isCorrect: true },
          ...wrongAnswers.map((text, i) => ({ id: `wrong-${i}`, text, isCorrect: false })),
        ].sort((a, b) => {
          const hashA = (a.id.charCodeAt(0) * 31 + index) % 1000
          const hashB = (b.id.charCodeAt(0) * 31 + index) % 1000
          return hashA - hashB
        })

        return {
          ...card,
          questionType: 'multiple-choice' as const,
          question: card.frontContent,
          options,
        }
      }
      else {
        const isTrue = index % 3 !== 0
        const correctAnswer = card.backContent
        let statement: string
        if (isTrue) {
          statement = `${card.frontContent} : ${correctAnswer}`
        }
        else {
          const otherCard = cards.find((_, i) => i !== index)
          const wrongAnswer = otherCard?.backContent || 'Réponse incorrecte'
          statement = `${card.frontContent} : ${wrongAnswer}`
        }
        return {
          ...card,
          questionType: 'true-false' as const,
          frontContent: statement,
          correctAnswer: isTrue ? 'true' : 'false',
        }
      }
    })
  }, [cards])

  const handleStart = useCallback(() => {
    const questions = generateTestQuestions()
    setTestQuestions(questions)
    startMutation.mutate()
  }, [startMutation, generateTestQuestions])

  const handleTimeUp = useCallback(() => {
    if (sessionId) {
      setShowLoading(true)
      setTimeout(() => {
        completeMutation.mutate({
          sessionId,
          correctCount,
          totalCount: totalCards,
          duration: TIME_LIMIT,
        })
        setPhase('completed')
        setShowLoading(false)
      }, 2000)
    }
  }, [sessionId, correctCount, totalCards, completeMutation])

  // Timer countdown
  useEffect(() => {
    if (phase !== 'active')
      return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  // Handle time up
  useEffect(() => {
    if (timeRemaining === 0 && phase === 'active' && !timeUpHandledRef.current) {
      timeUpHandledRef.current = true
      const timeoutId = setTimeout(() => handleTimeUp(), 0)
      return () => clearTimeout(timeoutId)
    }
    if (phase !== 'active') {
      timeUpHandledRef.current = false
    }
  }, [timeRemaining, phase, handleTimeUp])

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        setCorrectCount(prev => prev + 1)
      }

      if (currentCardIndex === totalCards - 1) {
        const duration = Math.floor((Date.now() - startTime) / 1000)
        setShowLoading(true)
        setTimeout(() => {
          if (sessionId) {
            completeMutation.mutate({
              sessionId,
              correctCount: isCorrect ? correctCount + 1 : correctCount,
              totalCount: totalCards,
              duration,
            })
          }
          setPhase('completed')
          setShowLoading(false)
        }, 2000)
      }
      else {
        setCurrentCardIndex(prev => prev + 1)
      }
    },
    [currentCardIndex, totalCards, startTime, sessionId, correctCount, completeMutation],
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
          <LogoLoader size="md" />
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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
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
          <Button variant="outline" className="w-full" onClick={() => navigate({ to: '/app' })}>
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
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </motion.div>
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">{totalCards}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">10</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div>
                  <div className="flex items-center justify-center text-3xl font-bold text-primary">
                    <Timer className="h-6 w-6" />
                  </div>
                  <div className="text-sm text-muted-foreground">Chronométré</div>
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4 text-warning" />
                  <span>Mode examen chronométré</span>
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
            {challengeStatus?.isInProgress ? 'Reprendre' : 'Commencer l\'examen'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate({ to: '/app' })}>
            Plus tard
          </Button>
        </main>
      </div>
    )
  }

  // Show loading screen
  if (showLoading) {
    return <TestLoading />
  }

  // Active phase - timed exam mode
  if (phase === 'active' && currentQuestion) {
    const progress = ((currentCardIndex + 1) / totalCards) * 100
    const timeProgress = (timeRemaining / TIME_LIMIT) * 100
    const isLowTime = timeRemaining < 60

    return (
      <div className="min-h-screen bg-background">
        <AppHeader title={`Question ${currentCardIndex + 1}/${totalCards}`} showAvatar={false} />
        <main className="mx-auto max-w-lg px-4 py-6">
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-2 text-lg font-bold ${isLowTime ? 'text-error animate-pulse' : 'text-foreground'}`}
              >
                <Timer className="h-5 w-5" />
                {formatTime(timeRemaining)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-success" />
                {correctCount}
                {' '}
                /
                {currentCardIndex}
              </div>
            </div>
            <Progress
              value={timeProgress}
              className={`h-2 ${isLowTime ? '[&>div]:bg-error' : '[&>div]:bg-primary'}`}
            />
            <Progress value={progress} className="h-1" />
          </div>
          <Test
            key={currentCardIndex}
            card={currentQuestion}
            cardIndex={currentCardIndex}
            totalCards={totalCards}
            questionType={currentQuestion.questionType}
            answerWith="definition"
            cardSide="term"
            onAnswer={handleAnswer}
          />
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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
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
          <Button size="lg" className="w-full" onClick={() => navigate({ to: '/app' })}>
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
