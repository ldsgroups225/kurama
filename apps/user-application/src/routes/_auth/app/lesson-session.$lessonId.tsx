import type { Reward } from '@/components/gamification'
import type { TestSettings } from '@/components/learning/test-settings-sheet'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { WifiOff } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RewardAnimation } from '@/components/gamification'
import { CardFactory } from '@/components/learning/CardFactory'
import { QuizSettingsSheet } from '@/components/learning/quiz-settings-sheet'
import { SessionControls } from '@/components/learning/session-controls'
import { SessionCounterBadge } from '@/components/learning/session-counter-badge'
import { SessionHeader } from '@/components/learning/session-header'
import { SessionSettingsDialog } from '@/components/learning/session-settings-dialog'
import { Test } from '@/components/learning/test'
import { TestLoading } from '@/components/learning/test-loading'
import { TestSettingsSheet } from '@/components/learning/test-settings-sheet'
import { AppHeader } from '@/components/main'
import { LogoLoader } from '@/components/ui/logo-loader'
import { getLessonDetails } from '@/core/functions/learning'
import { useAutoplay } from '@/hooks/use-autoplay'
import { useCardHeight } from '@/hooks/use-card-height'
import { useCardSwipeAnimations } from '@/hooks/use-card-swipe-animations'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useSessionState } from '@/hooks/use-session-state'
import { useStatsUpdate } from '@/hooks/use-stats-update'
import { createSwipeHandlers } from '@/hooks/use-swipe-handler'
import { useViewportHeight } from '@/hooks/use-viewport-height'
import { db } from '@/lib/db'
import { getMutationQueueManager } from '@/lib/mutation-queue'
import { trackRouteLoad } from '@/lib/performance-monitor'

interface SearchParams {
  mode?: 'flashcards' | 'quiz' | 'exam'
}

interface TestAnswer {
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  questionType: string
}

// Reserved for spaced repetition algorithm
// type QuizMode = 'memorize-all' | 'review-starred' | 'quick-review'

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
  // Quiz mode setter for future spaced repetition features (value not currently read)
  const [, setQuizMode] = useState<'memorize-all' | 'review-starred' | 'quick-review' | null>(null)

  // Test mode state
  const [showTestSettings, setShowTestSettings] = useState(mode === 'exam')
  const [testSettings, setTestSettings] = useState<TestSettings | null>(null)
  const [hasStartedTest, setHasStartedTest] = useState(false)
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([])
  const [showTestLoading, setShowTestLoading] = useState(false)

  // Stats update and reward animation state
  const [showReward, setShowReward] = useState(false)
  const [currentReward, setCurrentReward] = useState<Reward | null>(null)

  // Stats update hook with callbacks for level-up and achievements
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
        // Show first achievement (can queue others)
        setCurrentReward({
          type: 'achievement',
          title: 'Nouveau badge !',
          description: `Tu as débloqué : ${achievements[0]}`,
        })
        setShowReward(true)
      }
    },
  })

  // No need for mode reset effect - state is initialized based on mode prop
  // and the component will re-render with correct initial values when mode changes via URL

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

  // Offline support
  const { isOnline } = useOnlineStatus()
  const [pendingMutations, setPendingMutations] = useState(0)

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-session')
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

  // Fetch lesson data with offline support
  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      // Try to fetch from network first
      if (isOnline) {
        return await getLessonDetails({ data: Number(lessonId) })
      }

      // If offline, try to get from IndexedDB cache
      const cachedLesson = await db.queryCache.get(`lesson-${lessonId}`)
      if (cachedLesson) {
        return cachedLesson.value
      }

      throw new Error('No cached data available offline')
    },
    // Enable offline-first behavior
    networkMode: 'offlineFirst',
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  })

  const cards = useMemo(() => (lesson as any)?.cards ?? [], [lesson])
  const currentCard = cards[currentCardIndex]

  // Store quiz questions in state - generated in handleStartQuiz callback
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    cardType: 'multichoice' | 'true_false'
    question?: string
    options?: Array<{ id: string, text: string, isCorrect: boolean }>
    frontContent?: string
    correctAnswer?: string
    [key: string]: unknown
  }>>([])

  // Calculate progress based on mode
  const activeCards = mode === 'quiz' && hasStartedQuiz ? quizQuestions : cards
  const progress = activeCards.length > 0 ? ((currentCardIndex + 1) / activeCards.length) * 100 : 0
  const isLastCard = currentCardIndex === activeCards.length - 1

  // Navigation handlers
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

      // Update stats via server function (handles offline queueing internally)
      const result = await updateStats({
        lessonId: Number(lessonId),
        correctCount: correct,
        totalCount: totalCards,
        duration,
        mode: mode as 'flashcards' | 'quiz' | 'exam',
      })

      // Navigate to summary with stats result
      navigate({
        to: '/app/lesson-summary/$lessonId',
        params: { lessonId },
        search: {
          correct,
          incorrect,
          total: totalCards,
          duration,
          mode,
          // Pass XP earned for display
          xpEarned: result?.xpEarned ?? correct * 10,
          leveledUp: result?.leveledUp ? 'true' : undefined,
          newLevel: result?.currentLevel,
        },
      })
    },
    [navigate, lessonId, startTime, sessionStats, activeCards.length, mode, updateStats],
  )

  // Card interaction handlers
  const handleFlip = useCallback(() => {
    if (!isDragging) {
      setIsFlipped(prev => !prev)
    }
  }, [isDragging, setIsFlipped])

  const handleResponse = useCallback(
    (response: 'correct' | 'incorrect') => {
      incrementStat(response)

      if (isLastCard) {
        // Calculate final stats to pass to summary (state update is async)
        const finalCorrect = response === 'correct' ? sessionStats.correct + 1 : sessionStats.correct
        const finalIncorrect = response === 'incorrect' ? sessionStats.incorrect + 1 : sessionStats.incorrect
        navigateToSummary(finalCorrect, finalIncorrect)
      }
      else {
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

  // Swipe gesture handling
  const { handleDragStart, handleDragEnd } = createSwipeHandlers({
    x: swipeAnimations.x,
    onCorrect: () => handleResponse('correct'),
    onIncorrect: () => handleResponse('incorrect'),
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
  })

  // Store test questions in state - generated in handleStartTest callback
  const [testQuestions, setTestQuestions] = useState<Array<typeof cards[0] & { questionType: 'multiple-choice' | 'written' | 'true-false' }>>([])

  // Handle quiz mode start - generates questions here to avoid impure render
  const handleStartQuiz = useCallback((selectedMode: 'memorize-all' | 'review-starred' | 'quick-review') => {
    // Generate quiz questions in event handler (Math.random is safe here)
    if (cards.length > 0) {
      // Fisher-Yates shuffle for proper randomization
      const shuffled = [...cards]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      // Generate quiz questions with options from flashcard data
      const questions = shuffled.map((card, index) => {
        const questionType = Math.random() > 0.5 ? 'multichoice' : 'true_false'

        if (questionType === 'multichoice') {
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

          // Shuffle options
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
  }, [setCurrentCardIndex, cards])

  // Handle test mode start - generates questions here to avoid impure render
  const handleStartTest = useCallback((settings: TestSettings) => {
    // Generate test questions based on settings
    const availableTypes: Array<'multiple-choice' | 'written' | 'true-false'> = []
    if (settings.multipleChoice)
      availableTypes.push('multiple-choice')
    if (settings.trueFalse)
      availableTypes.push('true-false')
    if (settings.written)
      availableTypes.push('written')

    if (availableTypes.length > 0) {
      // Fisher-Yates shuffle for proper randomization
      const shuffled = [...cards]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      const selected = shuffled.slice(0, settings.questionCount)

      // Assign random question types
      const questions = selected.map((card) => {
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)]
        return {
          ...card,
          questionType: randomType,
        }
      })
      setTestQuestions(questions)
    }

    setTestSettings(settings)
    setHasStartedTest(true)
    setShowTestSettings(false)
    setTestAnswers([])
    setCurrentCardIndex(0)
  }, [cards, setCurrentCardIndex])

  // Handle test answer
  const handleTestAnswer = useCallback((isCorrect: boolean, userAnswer: string) => {
    const currentQuestion = testQuestions[currentCardIndex]
    const correctAnswer = testSettings?.answerWith === 'term'
      ? currentQuestion.frontContent || currentQuestion.front
      : currentQuestion.backContent || currentQuestion.back

    const newAnswer: TestAnswer = {
      question: testSettings?.answerWith === 'term'
        ? currentQuestion.backContent || currentQuestion.back
        : currentQuestion.frontContent || currentQuestion.front,
      userAnswer,
      correctAnswer,
      isCorrect,
      questionType: currentQuestion.questionType,
    }

    // Record answer
    setTestAnswers(prev => [...prev, newAnswer])

    // Update stats
    incrementStat(isCorrect ? 'correct' : 'incorrect')

    if (currentCardIndex === testQuestions.length - 1) {
      // Show loading screen
      setShowTestLoading(true)

      // Navigate to summary after 2 seconds
      setTimeout(async () => {
        const finalCorrect = isCorrect ? sessionStats.correct + 1 : sessionStats.correct
        const finalIncorrect = !isCorrect ? sessionStats.incorrect + 1 : sessionStats.incorrect
        const duration = Math.floor((Date.now() - startTime) / 1000)

        // Update stats via server function
        const result = await updateStats({
          lessonId: Number(lessonId),
          correctCount: finalCorrect,
          totalCount: testQuestions.length,
          duration,
          mode: 'exam',
        })

        navigate({
          to: '/app/test-summary/$lessonId',
          params: { lessonId },
          search: {
            correct: finalCorrect,
            incorrect: finalIncorrect,
            total: testQuestions.length,
            answers: JSON.stringify([...testAnswers, newAnswer]),
            xpEarned: result?.xpEarned,
            masteryCount: result?.masteryCount,
            isLessonCompleted: result?.isLessonCompleted ? 'true' : undefined,
            nextLessonUnlocked: result?.nextLessonUnlocked ? 'true' : undefined,
            nextLessonTitle: result?.nextLessonTitle ?? undefined,
          },
        })
      }, 2000)
    }
    else {
      setCurrentCardIndex(prev => prev + 1)
    }
  }, [currentCardIndex, testQuestions, testSettings, sessionStats, navigate, lessonId, testAnswers, incrementStat, setCurrentCardIndex, startTime, updateStats])

  // Show quiz/test settings based on mode - state is initialized correctly above
  // No need for useEffect since state is initialized with the correct value

  // Autoplay functionality
  useAutoplay({
    isAutoPlaying,
    isFlipped,
    cardsLength: cards.length,
    x: swipeAnimations.x,
    onFlip: () => setIsFlipped(true),
    onMarkCorrect: () => incrementStat('correct'),
    onNextCard: goToNextCard,
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Session" showAvatar={false} />
        <div className="flex items-center justify-center py-12">
          <LogoLoader size="md" />
        </div>
      </div>
    )
  }

  // Empty state
  if (!lesson || cards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Session" showAvatar={false} />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Aucune carte disponible</p>
        </div>
      </div>
    )
  }

  // Render different components based on mode
  const renderLearningMode = () => {
    // Common props for CardFactory
    const commonProps = {
      card: currentCard,
      cardIndex: currentCardIndex,
      totalCards: cards.length,
      onAnswer: (isCorrect: boolean) => {
        if (mode === 'exam') {
          // Test mode handles answers differently (accumulates them)
          // We might need to adapt Test component or handle it here
          // For now, let's keep Test component separate if it's complex
          // But for Quiz and Flashcards, we use CardFactory
          handleResponse(isCorrect ? 'correct' : 'incorrect')
        }
        else {
          handleResponse(isCorrect ? 'correct' : 'incorrect')
        }
      },
    }

    switch (mode) {
      case 'quiz':
        // Show quiz questions after settings are configured
        if (hasStartedQuiz && quizQuestions.length > 0) {
          const currentQuestion = quizQuestions[currentCardIndex]
          if (!currentQuestion)
            return null
          return (
            <CardFactory
              key={`quiz-${currentCardIndex}`}
              card={currentQuestion as unknown as Parameters<typeof CardFactory>[0]['card']}
              cardIndex={currentCardIndex}
              totalCards={quizQuestions.length}
              onAnswer={(isCorrect: boolean) => {
                handleResponse(isCorrect ? 'correct' : 'incorrect')
              }}
            />
          )
        }
        return null
      case 'exam':
        // Show loading screen
        if (showTestLoading) {
          return <TestLoading />
        }

        // Show test questions
        if (hasStartedTest && testQuestions.length > 0) {
          const currentQuestion = testQuestions[currentCardIndex]
          return (
            <Test
              key={currentCardIndex}
              card={currentQuestion}
              cardIndex={currentCardIndex}
              totalCards={testQuestions.length}
              questionType={currentQuestion.questionType}
              answerWith={testSettings?.answerWith || 'term'}
              cardSide={testSettings?.cardSide || 'term'}
              onAnswer={handleTestAnswer}
            />
          )
        }

        return null
      case 'flashcards':
      default: {
        // Force cardType to 'basic' for flashcard mode to ensure flashcard UI is shown
        const flashcardCard = { ...currentCard, cardType: 'basic' as const }
        return (
          <>
            <CardFactory
              {...commonProps}
              card={flashcardCard}
              // Flashcard specific props
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
    <div className="min-h-screen bg-background">
      <SessionHeader
        currentIndex={currentCardIndex}
        totalCards={activeCards.length}
        progress={progress}
        onClose={navigateToLesson}
        onSettings={() => setShowSettings(true)}
      />

      {/* Offline indicator */}
      {!isOnline && (
        <div className="mx-auto max-w-lg px-4 pt-2">
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
            <WifiOff className="h-4 w-4" />
            <span>Mode hors ligne - Vos progrès seront synchronisés plus tard</span>
            {pendingMutations > 0 && (
              <span className="ml-auto rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium">
                {pendingMutations}
                {' '}
                en attente
              </span>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-lg py-6 px-4">
        {(mode !== 'quiz' || hasStartedQuiz) && (
          <div className="mb-6 flex items-center justify-between">
            <SessionCounterBadge
              count={sessionStats.incorrect}
              type="incorrect"
              backgroundColor={swipeAnimations.incorrectBadge.backgroundColor}
              scale={swipeAnimations.incorrectBadge.scale}
              showPreview={swipeAnimations.incorrectBadge.showPreview}
              hideCount={swipeAnimations.incorrectBadge.hideCount}
            />

            <SessionCounterBadge
              count={sessionStats.correct}
              type="correct"
              backgroundColor={swipeAnimations.correctBadge.backgroundColor}
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

      {/* Reward Animation for level-ups and achievements */}
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
    </div>
  )
}
