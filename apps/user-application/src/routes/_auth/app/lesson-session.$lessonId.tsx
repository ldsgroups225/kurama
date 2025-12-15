import type { Reward } from '@/components/gamification'
import type { TestSettings } from '@/components/learning/test-settings-sheet'
import type { XPCalculationResult } from '@/lib/flashcard-gamification'
import type { LearningSession } from '@/lib/learning-mode-gamification'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { ArrowLeft, SlidersHorizontal, WifiOff } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RewardAnimation, XPFeedback } from '@/components/gamification'
import { CardFactory } from '@/components/learning/CardFactory'
import { EnhancedExam } from '@/components/learning/enhanced-exam'
import { EnhancedQuiz } from '@/components/learning/enhanced-quiz'
import { QuizSettingsSheet } from '@/components/learning/quiz-settings-sheet'
import { SessionControls } from '@/components/learning/session-controls'
import { SessionCounterBadge } from '@/components/learning/session-counter-badge'
import { SessionSettingsDialog } from '@/components/learning/session-settings-dialog'

import { TestLoading } from '@/components/learning/test-loading'
import { TestSettingsSheet } from '@/components/learning/test-settings-sheet'
import { AppHeader } from '@/components/main'
import { Button } from '@/components/ui/button'
import { LogoLoader } from '@/components/ui/logo-loader'
import { getLessonDetails } from '@/core/functions/learning'
import { useAutoplay } from '@/hooks/use-autoplay'
import { useCardHeight } from '@/hooks/use-card-height'
import { useCardSwipeAnimations } from '@/hooks/use-card-swipe-animations'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useQuizVibration } from '@/hooks/use-quiz-vibration'
import { useSessionState } from '@/hooks/use-session-state'
import { useStatsUpdate } from '@/hooks/use-stats-update'
import { useStreakVibration } from '@/hooks/use-streak-vibration'
import { createSwipeHandlers } from '@/hooks/use-swipe-handler'
import { useViewportHeight } from '@/hooks/use-viewport-height'
import { db } from '@/lib/db'
import { calculateFlashcardXP, getCardDifficulty, getIntervalStage } from '@/lib/flashcard-gamification'
import { getMutationQueueManager } from '@/lib/mutation-queue'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

interface SearchParams {
  mode?: 'flashcards' | 'quiz' | 'exam'
}

export const Route = createFileRoute('/_auth/app/lesson-session/$lessonId')({
  component: SessionPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      mode: (search.mode as SearchParams['mode']) || 'flashcards',
    }
  },
})

function SessionPage() {
  const { lessonId } = useParams({ from: '/_auth/app/lesson-session/$lessonId' })
  const { mode } = useSearch({ from: '/_auth/app/lesson-session/$lessonId' })
  const navigate = useNavigate()

  // Quiz mode state
  const [showQuizSettings, setShowQuizSettings] = useState(mode === 'quiz')
  const [hasStartedQuiz, setHasStartedQuiz] = useState(false)
  const [, setQuizMode] = useState<'memorize-all' | 'review-starred' | 'quick-review' | null>(null)

  // Test mode state
  const [showTestSettings, setShowTestSettings] = useState(mode === 'exam')
  const [hasStartedTest, setHasStartedTest] = useState(false)
  const [showTestLoading] = useState(false)

  // Stats update and reward animation state
  const [showReward, setShowReward] = useState(false)
  const [currentReward, setCurrentReward] = useState<Reward | null>(null)

  // Enhanced XP feedback state
  const [showXPFeedback, setShowXPFeedback] = useState(false)
  const [currentXPResult, setCurrentXPResult] = useState<XPCalculationResult | null>(null)

  // Enhanced session tracking with proper type safety
  const [enhancedSession, setEnhancedSession] = useState<LearningSession>(() => {
    // Validate mode parameter
    const validModes = ['flashcards', 'quiz', 'exam', 'quick-review'] as const
    const sessionMode = validModes.includes(mode as any)
      ? (mode as LearningSession['mode'])
      : 'flashcards' // fallback to safe default

    return {
      mode: sessionMode,
      streakDays: 0, // This would come from user stats
      currentCombo: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      sessionStartTime: new Date(),
      averageTimePerQuestion: 0,
      perfectAnswers: 0,
      struggledAnswers: 0,
    }
  })

  const { updateStats } = useStatsUpdate({
    onLevelUp: (newLevel) => {
      setCurrentReward({
        type: 'level_up',
        title: `Niveau ${newLevel} !`,
        description: 'Félicitations ! Tu as atteint un nouveau niveau !',
        value: newLevel,
      })
      setShowReward(true)
    },
    onAchievementUnlocked: (achievements) => {
      if (achievements.length > 0) {
        setCurrentReward({
          type: 'achievement',
          title: 'Nouveau badge !',
          description: `Tu as débloqué : ${achievements[0]}`,
        })
        setShowReward(true)
      }
    },
  })

  // Session state management
  const {
    currentCardIndex,
    setCurrentCardIndex,
    isFlipped,
    setIsFlipped,
    sessionStats,
    incrementStat,
    startTime,
    showSettings,
    setShowSettings,
    cardOrientation,
    setCardOrientation,
    isDragging,
    setIsDragging,
    isAutoPlaying,
    setIsAutoPlaying,
    addToHistory,
    popFromHistory,
    resetSession,
  } = useSessionState()

  // Animation and layout
  const viewportHeight = useViewportHeight()
  const cardHeight = useCardHeight(viewportHeight)
  const swipeAnimations = useCardSwipeAnimations()

  // Vibration feedback hooks
  const streakVibration = useStreakVibration()
  const quizVibration = useQuizVibration()

  // Offline support
  const { isOnline } = useOnlineStatus()
  const [pendingMutations, setPendingMutations] = useState(0)

  useEffect(() => {
    const endTracking = trackRouteLoad('app-session')
    return endTracking
  }, [])

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

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (isOnline) {
        return await getLessonDetails({ data: Number(lessonId) })
      }
      const cachedLesson = await db.queryCache.get(`lesson-${lessonId}`)
      if (cachedLesson) {
        return cachedLesson.value
      }
      throw new Error('No cached data available offline')
    },
    networkMode: 'offlineFirst',
    staleTime: 5 * 60 * 1000,
  })

  const cards = useMemo(() => (lesson as any)?.cards ?? [], [lesson])
  const currentCard = cards[currentCardIndex]

  const [quizQuestions, setQuizQuestions] = useState<Array<{
    cardType: 'multichoice' | 'true_false'
    question?: string
    options?: Array<{ id: string, text: string, isCorrect: boolean }>
    frontContent?: string
    correctAnswer?: string
    [key: string]: unknown
  }>>([])

  const activeCards = mode === 'quiz' && hasStartedQuiz ? quizQuestions : cards
  const progress = activeCards.length > 0 ? ((currentCardIndex + 1) / activeCards.length) * 100 : 0
  const isLastCard = currentCardIndex === activeCards.length - 1

  const navigateToLesson = useCallback(() => {
    navigate({
      to: '/app/lessons/$lessonId',
      params: { lessonId },
    })
  }, [navigate, lessonId])

  const navigateToSummary = useCallback(
    async (finalCorrect?: number, finalIncorrect?: number) => {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      const correct = finalCorrect ?? sessionStats.correct
      const incorrect = finalIncorrect ?? sessionStats.incorrect
      const totalCards = activeCards.length

      const result = await updateStats({
        lessonId: Number(lessonId),
        correctCount: correct,
        totalCount: totalCards,
        duration,
        mode: mode as 'flashcards' | 'quiz' | 'exam',
      })

      navigate({
        to: '/app/lesson-summary/$lessonId',
        params: { lessonId },
        search: {
          correct,
          incorrect,
          total: totalCards,
          duration,
          mode,
          xpEarned: result?.xpEarned ?? correct * 10,
          leveledUp: result?.leveledUp ? 'true' : undefined,
          newLevel: result?.currentLevel,
        },
      })
    },
    [activeCards.length, lessonId, mode, navigate, sessionStats, startTime, updateStats],
  )

  const handleFlip = useCallback(() => {
    if (!isDragging) {
      setIsFlipped(prev => !prev)
    }
  }, [isDragging, setIsFlipped])

  const handleResponse = useCallback(
    (response: 'correct' | 'incorrect', timeSpent?: number) => {
      incrementStat(response)

      // Calculate new combo and streak values
      const newCombo = response === 'correct' ? (enhancedSession.currentCombo || 0) + 1 : 0
      const newCorrectCount = enhancedSession.correctAnswers! + (response === 'correct' ? 1 : 0)

      // Update enhanced session stats
      setEnhancedSession(prev => ({
        ...prev,
        totalQuestions: prev.totalQuestions! + 1,
        correctAnswers: newCorrectCount,
        incorrectAnswers: prev.incorrectAnswers! + (response === 'incorrect' ? 1 : 0),
        currentCombo: newCombo,
        averageTimePerQuestion: timeSpent || prev.averageTimePerQuestion || 0,
        perfectAnswers: response === 'correct' && (timeSpent || 0) < 5
          ? (prev.perfectAnswers || 0) + 1
          : prev.perfectAnswers || 0,
        struggledAnswers: response === 'incorrect' || (timeSpent || 0) > 10
          ? (prev.struggledAnswers || 0) + 1
          : prev.struggledAnswers || 0,
      }))

      // Trigger vibration feedback based on mode and response
      if (response === 'correct') {
        if (mode === 'flashcards') {
          // Trigger streak vibration for flashcards
          streakVibration.triggerStreakVibration(newCorrectCount)
        }
        else if (mode === 'quiz' || mode === 'exam') {
          // Trigger combo vibration for quiz/exam modes
          quizVibration.triggerComboVibration(newCombo)
        }
      }
      else {
        // Reset streaks/combos on incorrect answers
        if (mode === 'flashcards') {
          streakVibration.resetStreak()
        }
        else if (mode === 'quiz' || mode === 'exam') {
          quizVibration.resetCombo()
        }
      }

      // Calculate enhanced XP for flashcards
      if (mode === 'flashcards' && response === 'correct') {
        const card = currentCard
        const cardDifficulty = getCardDifficulty(card?.easeFactor || 2500)
        const intervalStage = getIntervalStage(card?.repetitions || 0, card?.lastReviewedAt)

        const flashcardCard = {
          id: card?.id || currentCardIndex,
          difficulty: cardDifficulty,
          intervalStage,
          responseQuality: (timeSpent || 0) < 3
            ? 'perfect' as const
            : (timeSpent || 0) < 8 ? 'good' as const : 'struggled' as const,
          lastReviewedAt: card?.lastReviewedAt,
          easeFactor: card?.easeFactor || 2500,
          repetitions: card?.repetitions || 0,
        }

        const flashcardSession = {
          streakDays: enhancedSession.streakDays || 0,
          currentCombo: enhancedSession.currentCombo || 0,
          totalCardsToday: enhancedSession.totalQuestions || 0,
          sessionStartTime: enhancedSession.sessionStartTime || new Date(),
          perfectCards: enhancedSession.perfectAnswers || 0,
        }

        const xpResult = calculateFlashcardXP(flashcardCard, flashcardSession, true)

        if (xpResult.totalXP > 0) {
          setCurrentXPResult(xpResult)
          setShowXPFeedback(true)
        }
      }

      if (isLastCard) {
        const finalCorrect = response === 'correct' ? sessionStats.correct + 1 : sessionStats.correct
        const finalIncorrect = response === 'incorrect' ? sessionStats.incorrect + 1 : sessionStats.incorrect

        // Trigger session complete vibration
        if (mode === 'flashcards') {
          streakVibration.triggerSessionComplete()
        }
        else if (mode === 'quiz') {
          const finalScore = Math.round((finalCorrect / (finalCorrect + finalIncorrect)) * 100)
          quizVibration.triggerQuizComplete(finalScore)
        }
        else if (mode === 'exam') {
          const finalScore = Math.round((finalCorrect / (finalCorrect + finalIncorrect)) * 100)
          quizVibration.triggerQuizComplete(finalScore)
        }

        navigateToSummary(finalCorrect, finalIncorrect)
      }
      else {
        // Trigger question advance vibration for quiz/exam modes
        if (mode === 'quiz' || mode === 'exam') {
          quizVibration.triggerQuestionAdvance()
        }

        setCurrentCardIndex(prev => prev + 1)
        setIsFlipped(false)
        swipeAnimations.x.set(0)
      }
    },
    [
      incrementStat,
      isLastCard,
      navigateToSummary,
      setCurrentCardIndex,
      setIsFlipped,
      swipeAnimations.x,
      sessionStats,
      mode,
      currentCard,
      currentCardIndex,
      enhancedSession,
      quizVibration,
      streakVibration,
    ],
  )

  const goToNextCard = useCallback(() => {
    addToHistory(currentCardIndex)

    if (currentCardIndex === cards.length - 1) {
      setCurrentCardIndex(0)
      if (isAutoPlaying) {
        resetSession()
      }
    }
    else {
      setCurrentCardIndex(prev => prev + 1)
    }

    setIsFlipped(false)
    swipeAnimations.x.set(0)
  }, [
    addToHistory,
    currentCardIndex,
    cards.length,
    isAutoPlaying,
    resetSession,
    setCurrentCardIndex,
    setIsFlipped,
    swipeAnimations.x,
  ])

  const handlePrevCard = useCallback(() => {
    const previousIndex = popFromHistory()
    if (previousIndex !== null) {
      setCurrentCardIndex(previousIndex)
      setIsFlipped(false)
      swipeAnimations.x.set(0)

      if (isAutoPlaying) {
        setIsAutoPlaying(false)
      }
    }
  }, [popFromHistory, setCurrentCardIndex, setIsFlipped, swipeAnimations.x, isAutoPlaying, setIsAutoPlaying])

  const handleResetSession = useCallback(() => {
    resetSession()
    setShowSettings(false)
    swipeAnimations.x.set(0)
  }, [resetSession, setShowSettings, swipeAnimations.x])

  const { handleDragStart, handleDragEnd } = createSwipeHandlers({
    x: swipeAnimations.x,
    onCorrect: () => handleResponse('correct'),
    onIncorrect: () => handleResponse('incorrect'),
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
  })

  // Store test questions
  const [testQuestions, setTestQuestions] = useState<Array<typeof cards[0] & { questionType: 'multiple-choice' | 'written' | 'true-false' }>>([])

  // Helper to start quiz
  const handleStartQuiz = useCallback((selectedMode: 'memorize-all' | 'review-starred' | 'quick-review') => {
    if (cards.length > 0) {
      const shuffled = [...cards]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      const questions = shuffled.map((card, index) => {
        // Check if card already has real options (multichoice card from database)
        const hasRealOptions = card.options && Array.isArray(card.options) && card.options.length > 0
        const isMultichoiceCard = card.cardType === 'multichoice' || card.card_type === 'multichoice'
        const isTrueFalseCard = card.cardType === 'true_false' || card.card_type === 'true_false'

        // Use card's native type if available, otherwise randomly assign
        let questionType: 'multichoice' | 'true_false'
        if (isMultichoiceCard && hasRealOptions) {
          questionType = 'multichoice'
        }
        else if (isTrueFalseCard) {
          questionType = 'true_false'
        }
        else {
          questionType = Math.random() > 0.5 ? 'multichoice' : 'true_false'
        }

        if (questionType === 'multichoice') {
          // Use real options if available
          if (hasRealOptions) {
            return {
              ...card,
              cardType: 'multichoice' as const,
              question: card.question || card.frontContent || card.front,
              options: card.options,
              correctAnswer: card.correctAnswer || card.correct_answer,
            }
          }

          // Fallback: generate options from other cards
          const correctAnswer = card.backContent || card.back
          const otherCards = shuffled.filter((_, i) => i !== index)
          const wrongAnswers = otherCards
            .slice(0, 3)
            .map(c => c.backContent || c.back)
            .filter(Boolean)

          const allOptions = [
            { id: 'correct', text: correctAnswer, isCorrect: true },
            ...wrongAnswers.map((text, i) => ({ id: `wrong-${i}`, text, isCorrect: false })),
          ]

          // Shuffle
          for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = allOptions[i]
            allOptions[i] = allOptions[j]!
            allOptions[j] = temp!
          }

          return {
            ...card,
            cardType: 'multichoice' as const,
            question: card.frontContent || card.front,
            options: allOptions,
            correctAnswer,
          }
        }
        else {
          const isTrue = Math.random() > 0.5
          const correctAnswer = card.backContent || card.back
          let statement: string
          if (isTrue) {
            statement = `${card.frontContent || card.front} : ${correctAnswer}`
          }
          else {
            const otherCard = shuffled.find((_, i) => i !== index)
            const wrongAnswer = otherCard?.backContent || otherCard?.back || 'Réponse incorrecte'
            statement = `${card.frontContent || card.front} : ${wrongAnswer}`
          }

          return {
            ...card,
            cardType: 'true_false' as const,
            frontContent: statement,
            correctAnswer: isTrue ? 'true' : 'false',
          }
        }
      })

      setQuizQuestions(questions)
    }

    setQuizMode(selectedMode)
    setHasStartedQuiz(true)
    setShowQuizSettings(false)
    setCurrentCardIndex(0)
  }, [cards, setCurrentCardIndex])

  // Handle test start
  const handleStartTest = useCallback((settings: TestSettings) => {
    const availableTypes: Array<'multiple-choice' | 'written' | 'true-false'> = []
    if (settings.multipleChoice)
      availableTypes.push('multiple-choice')
    if (settings.trueFalse)
      availableTypes.push('true-false')
    if (settings.written)
      availableTypes.push('written')

    if (availableTypes.length > 0) {
      const shuffled = [...cards]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      const selected = shuffled.slice(0, settings.questionCount)

      const questions = selected.map((card) => {
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)]
        return {
          ...card,
          questionType: randomType,
        }
      })
      setTestQuestions(questions)
    }

    setHasStartedTest(true)
    setShowTestSettings(false)
    setCurrentCardIndex(0)
  }, [cards, setCurrentCardIndex])

  useAutoplay({
    isAutoPlaying,
    isFlipped,
    cardsLength: cards.length,
    x: swipeAnimations.x,
    onFlip: () => setIsFlipped(true),
    onMarkCorrect: () => incrementStat('correct'),
    onNextCard: goToNextCard,
  })

  // LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LogoLoader size="md" />
      </div>
    )
  }

  // EMPTY
  if (!lesson || cards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <AppHeader title="Session" showAvatar={false} className="bg-transparent/0 border-none" />
        <p className="text-zinc-500">Aucune carte disponible</p>
      </div>
    )
  }

  const renderLearningMode = () => {
    const commonProps = {
      card: currentCard,
      cardIndex: currentCardIndex,
      totalCards: cards.length,
      onAnswer: (isCorrect: boolean, timeSpent?: number) => {
        handleResponse(isCorrect ? 'correct' : 'incorrect', timeSpent)
      },
    }

    switch (mode) {
      case 'quiz':
        if (hasStartedQuiz && quizQuestions.length > 0) {
          const currentQuestion = quizQuestions[currentCardIndex]
          if (!currentQuestion)
            return null
          return (
            <EnhancedQuiz
              key={`quiz-${currentCardIndex}`}
              card={currentQuestion}
              cardIndex={currentCardIndex}
              totalCards={quizQuestions.length}
              session={enhancedSession}
              onAnswer={(isCorrect: boolean, timeSpent: number) => {
                handleResponse(isCorrect ? 'correct' : 'incorrect', timeSpent)
              }}
              onXPEarned={() => {
                // Handle XP feedback for quiz mode
              }}
            />
          )
        }
        return null
      case 'exam':
        if (showTestLoading) {
          return <TestLoading />
        }
        if (hasStartedTest && testQuestions.length > 0) {
          const currentQuestion = testQuestions[currentCardIndex]
          return (
            <EnhancedExam
              key={`exam-${currentCardIndex}`}
              card={currentQuestion}
              cardIndex={currentCardIndex}
              totalCards={testQuestions.length}
              timeLimit={60}
              session={enhancedSession}
              onAnswer={(isCorrect: boolean, timeSpent: number) => {
                handleResponse(isCorrect ? 'correct' : 'incorrect', timeSpent)
              }}
              onTimeUp={() => {
                // Handle time up - auto-submit as incorrect
                handleResponse('incorrect', 60)
              }}
              onXPEarned={() => {
                // Handle XP feedback for exam mode
              }}
            />
          )
        }
        return null
      case 'flashcards':
      default: {
        const flashcardCard = { ...currentCard, cardType: 'basic' as const }
        return (
          <>
            <CardFactory
              {...commonProps}
              card={flashcardCard}
              cardOrientation={cardOrientation}
              cardHeight={cardHeight}
              x={swipeAnimations.x}
              rotate={swipeAnimations.rotate}
              opacity={swipeAnimations.opacity}
              backgroundColor={swipeAnimations.cardBackgroundColor}
              borderColor={swipeAnimations.cardBorderColor}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />

            <SessionControls
              isAutoPlaying={isAutoPlaying}
              canGoBack={sessionStats.correct + sessionStats.incorrect > 0}
              onToggleAutoPlay={() => setIsAutoPlaying(prev => !prev)}
              onPrevCard={handlePrevCard}
            />
          </>
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[20%] w-[60%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Custom Inline Header for Premium Look */}
      <header className="relative z-50 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={navigateToLesson} className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-foreground tracking-wide">
            {currentCardIndex + 1}
            {' '}
            /
            {activeCards.length}
          </span>
          {/* Simple progress dot indicator */}
          <div className="flex gap-1 mt-1">
            {activeCards.slice(0, Math.min(activeCards.length, 10)).map((_: any, i: number) => (
              <div
                key={generateUUID()}
                className={cn(
                  'h-1 w-1 rounded-full bg-muted',
                  i === currentCardIndex
                    ? 'bg-primary w-3 transition-all'
                    : i < currentCardIndex ? 'bg-primary/50' : '',
                )}
              />
            ))}
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="text-zinc-400 hover:text-foreground hover:bg-foreground/5 rounded-full">
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </header>

      {/* Progress Line */}
      <div className="w-full h-px bg-muted relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-indigo-500 shadow-glow-indigo"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {!isOnline && (
        <div className="mx-auto max-w-lg px-4 pt-2">
          <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-sm text-orange-400">
            <WifiOff className="h-4 w-4" />
            <span>Hors ligne</span>
            {pendingMutations > 0 && (
              <span className="ml-auto rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium">
                {pendingMutations}
              </span>
            )}
          </div>
        </div>
      )}

      <main className="relative z-10 mx-auto max-w-lg pt-6 px-4">
        {(mode !== 'quiz' || hasStartedQuiz) && (
          <div className="mb-6 flex items-center justify-between">
            <SessionCounterBadge
              count={sessionStats.incorrect}
              type="incorrect"
              backgroundColor={swipeAnimations.incorrectBadge.backgroundColor as any}
              scale={swipeAnimations.incorrectBadge.scale}
              showPreview={swipeAnimations.incorrectBadge.showPreview}
              hideCount={swipeAnimations.incorrectBadge.hideCount}
            />

            <SessionCounterBadge
              count={sessionStats.correct}
              type="correct"
              backgroundColor={swipeAnimations.correctBadge.backgroundColor as any}
              scale={swipeAnimations.correctBadge.scale}
              showPreview={swipeAnimations.correctBadge.showPreview}
              hideCount={swipeAnimations.correctBadge.hideCount}
            />
          </div>
        )}

        {renderLearningMode()}
      </main>

      <SessionSettingsDialog
        open={showSettings}
        cardOrientation={cardOrientation}
        onOpenChange={setShowSettings}
        onOrientationChange={setCardOrientation}
        onReset={handleResetSession}
      />

      {mode === 'quiz' && (
        <QuizSettingsSheet
          open={showQuizSettings}
          lessonTitle={(lesson as any)?.title || 'Leçon'}
          totalCards={cards.length}
          onOpenChange={setShowQuizSettings}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {mode === 'exam' && (
        <TestSettingsSheet
          open={showTestSettings}
          lessonTitle={(lesson as any)?.title || 'Leçon'}
          totalCards={cards.length}
          onOpenChange={setShowTestSettings}
          onStartTest={handleStartTest}
        />
      )}

      {currentReward && (
        <RewardAnimation
          reward={currentReward}
          show={showReward}
          onClose={() => {
            setShowReward(false)
            setCurrentReward(null)
          }}
        />
      )}

      {/* Enhanced XP Feedback */}
      <XPFeedback
        result={currentXPResult}
        show={showXPFeedback}
        onComplete={() => {
          setShowXPFeedback(false)
          setCurrentXPResult(null)
        }}
      />
    </div>
  )
}
