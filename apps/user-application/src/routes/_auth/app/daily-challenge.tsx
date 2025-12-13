import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Check, Clock, Flame, Loader2, Play, Timer, Trophy, X, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RewardAnimation } from '@/components/gamification'
import { Test } from '@/components/learning/test'
import { AppHeader } from '@/components/main'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'

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

  // Start Mutation
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

  // Complete Mutation
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LogoLoader size="md" />
      </div>
    )
  }

  // Phase-based Ambient Background
  const getAmbientBackground = () => {
    if (phase === 'active') {
      // Intense Orange/Red for Focus/Time
      return (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px]" />
        </>
      )
    }
    else if (phase === 'completed' || challengeStatus?.isCompleted) {
      // Success Green/Gold
      return (
        <>
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[70%] h-[70%] rounded-full bg-emerald-600/10 blur-[130px]" />
        </>
      )
    }
    // Default Preview (Purple/Blue)
    return (
      <>
        <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </>
    )
  }

  // Already completed today
  if (challengeStatus?.isCompleted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {getAmbientBackground()}
        </div>

        <AppHeader title="Défi du Jour" showAvatar={false} className="bg-transparent/0 border-none" />

        <main className="relative z-10 mx-auto max-w-lg space-y-8 px-5 py-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50">
              <Check className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="mb-2 text-3xl font-bold bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">Défi Complété !</h2>
            <p className="text-muted-foreground">Revenez demain pour un nouveau défi</p>
          </motion.div>

          {/* Stats Card */}
          <div className="rounded-3xl border border-border bg-card backdrop-blur-xl p-6 text-center shadow-lg">
            <div className="mb-6">
              <span className="text-5xl font-bold bg-linear-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                {challengeStatus.score}
                %
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 px-3 py-1.5 text-sm gap-1.5">
                <Zap className="h-3.5 w-3.5 fill-current" />
                +
                {challengeStatus.xpEarned}
                {' '}
                XP
              </Badge>

              {challengeStatus.consecutiveDays > 1 && (
                <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20 px-3 py-1.5 text-sm gap-1.5">
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  {challengeStatus.consecutiveDays}
                  {' '}
                  jours
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted py-2 px-4 rounded-full w-fit mx-auto border border-border">
            <Clock className="h-4 w-4" />
            <span className="font-medium">
              Prochain défi dans
              {formatTimeUntilReset(challengeStatus.timeUntilReset)}
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-border bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
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
      <div className="min-h-screen bg-background text-foreground">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {getAmbientBackground()}
        </div>

        <AppHeader title="" showAvatar={false} className="bg-transparent/0 border-none" />

        <main className="relative z-10 mx-auto max-w-lg space-y-6 px-5 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-indigo-500/30">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-3xl font-bold bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">Défi du Jour</h2>
            <p className="text-muted-foreground font-medium">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </motion.div>

          <div className="rounded-3xl border border-border bg-card backdrop-blur-xl p-1 overflow-hidden">
            <div className="p-6 space-y-6 bg-muted/50 rounded-[20px]">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 border-b border-border pb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">{totalCards}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Questions</div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-2xl font-bold text-foreground mb-1">10</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-2xl font-bold text-foreground mb-1">
                    <Timer className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Chrono</div>
                </div>
              </div>

              {/* Rewards List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-amber-500 fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Gain d'expérience</div>
                    <div className="text-xs text-muted-foreground">Jusqu'à 150 XP possibles</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-orange-500 fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Bonus de série</div>
                    <div className="text-xs text-muted-foreground">+25 XP si maintenu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-xl shadow-indigo-500/20 border-0 rounded-2xl text-white"
              onClick={handleStart}
              disabled={startMutation.isPending}
            >
              {startMutation.isPending
                ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )
                : (
                  <Play className="mr-2 h-5 w-5 fill-current" />
                )}
              {challengeStatus?.isInProgress ? 'Reprendre le défi' : 'Commencer le défi'}
            </Button>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => navigate({ to: '/app' })}
            >
              Faire plus tard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Show loading screen - Premium Style
  if (showLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <LogoLoader size="lg" />
        <p className="mt-8 text-lg font-medium animate-pulse text-muted-foreground">Calcul des résultats...</p>
      </div>
    )
  }

  // Active phase - timed exam mode
  if (phase === 'active' && currentQuestion) {
    const timeProgress = (timeRemaining / TIME_LIMIT) * 100
    const isLowTime = timeRemaining < 60

    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Ambient Background for Focus */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {getAmbientBackground()}
        </div>

        <AppHeader title="" showAvatar={false} className="bg-transparent/0 border-none relative z-20" />

        <main className="relative z-10 mx-auto max-w-lg px-4 pt-0 pb-6 w-full h-full flex flex-col">
          {/* Top Bar Stats */}
          <div className="mb-6 bg-card/80 backdrop-blur-md rounded-2xl p-4 border border-border shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                'flex items-center gap-2 font-mono text-xl font-bold transition-colors',
                isLowTime ? 'text-red-500 animate-pulse' : 'text-foreground',
              )}
              >
                <Timer className="h-5 w-5" />
                {formatTime(timeRemaining)}
              </div>

              <Badge variant="secondary" className="bg-muted text-muted-foreground border-border gap-2 px-3">
                <span>Question</span>
                <span className="font-bold text-foreground">
                  {currentCardIndex + 1}
                  {' '}
                  <span className="text-muted-foreground">
                    /
                    {totalCards}
                  </span>
                </span>
              </Badge>
            </div>

            {/* Progress Bars */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                <span>Temps écoulé</span>
              </div>
              <Progress
                value={timeProgress}
                className={cn('h-1.5 bg-muted', isLowTime ? '[&>div]:bg-red-500' : '[&>div]:bg-indigo-500')}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <Test
              key={currentCardIndex}
              card={currentQuestion}
              cardIndex={currentCardIndex}
              totalCards={totalCards}
              questionType={currentQuestion.questionType}
              answerWith="definition"
              cardSide="term"
              onAnswer={handleAnswer}
            // Pass custom classNames if Test component accepts them, or just rely on global styles
            />
          </div>
        </main>
      </div>
    )
  }

  // Completed phase - Revamped Results
  if (phase === 'completed') {
    const score = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0
    const baseXP = 100
    const scoreBonus = Math.round(score * 0.5)
    const streakBonus = (challengeStatus?.consecutiveDays ?? 0) > 0 ? 25 : 0
    const totalXP = baseXP + scoreBonus + streakBonus

    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {getAmbientBackground()}
        </div>

        <AppHeader title="Résultats" showAvatar={false} className="bg-transparent/0 border-none" />

        <main className="relative z-10 mx-auto max-w-lg space-y-6 px-5 py-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-linear-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-purple-500/30 ring-4 ring-white/10">
              <Trophy className="h-14 w-14 text-white" />
            </div>

            <h2 className="mb-1 text-3xl font-bold text-foreground">Défi Terminé !</h2>
            <p className="text-muted-foreground">Voici votre score pour aujourd'hui</p>
          </motion.div>

          <Card className="overflow-hidden border-border bg-card backdrop-blur-xl rounded-4xl">
            <CardContent className="p-0">
              {/* Score Header */}
              <div className="bg-linear-to-r from-emerald-500/10 to-teal-500/10 p-8 text-center border-b border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10">
                  <div className="text-6xl font-black text-emerald-500 mb-1 tracking-tight">
                    {score}
                    <span className="text-3xl align-top opacity-60">%</span>
                  </div>
                  <div className="text-sm font-medium text-emerald-600 uppercase tracking-widest">Score Final</div>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="p-5 text-center hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-2xl font-bold text-foreground">{correctCount}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium uppercase">Correct</div>
                </div>
                <div className="p-5 text-center hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <X className="h-5 w-5 text-red-500" />
                    <span className="text-2xl font-bold text-foreground">{totalCards - correctCount}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium uppercase">Incorrect</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XP Card */}
          <div className="relative rounded-4xl overflow-hidden border border-amber-500/20 p-6 bg-linear-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                  <Zap className="h-6 w-6 text-amber-600 fill-current" />
                </div>
                <div>
                  <div className="text-sm text-yellow-600">Total XP Gagné</div>
                  <div className="text-2xl font-bold text-amber-600">
                    +
                    {totalXP}
                    {' '}
                    XP
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Base</span>
                <span>
                  +
                  {baseXP}
                  {' '}
                  XP
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Bonus de score</span>
                <span>
                  +
                  {scoreBonus}
                  {' '}
                  XP
                </span>
              </div>
              {streakBonus > 0 && (
                <div className="flex justify-between text-orange-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {' '}
                    Bonus série
                  </span>
                  <span>
                    +
                    {streakBonus}
                    {' '}
                    XP
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20"
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
