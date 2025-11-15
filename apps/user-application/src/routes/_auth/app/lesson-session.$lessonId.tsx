import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Flashcard } from '@/components/learning/flashcard'
import { Quiz } from '@/components/learning/quiz'
import { Exam } from '@/components/learning/exam'
import { QuizSettingsSheet } from '@/components/learning/quiz-settings-sheet'
import { SessionControls } from '@/components/learning/session-controls'
import { SessionCounterBadge } from '@/components/learning/session-counter-badge'
import { SessionHeader } from '@/components/learning/session-header'
import { SessionSettingsDialog } from '@/components/learning/session-settings-dialog'
import { AppHeader } from '@/components/main'
import { getLessonDetails } from '@/core/functions/learning'
import { useAutoplay } from '@/hooks/use-autoplay'
import { useCardHeight } from '@/hooks/use-card-height'
import { useCardSwipeAnimations } from '@/hooks/use-card-swipe-animations'
import { useSessionState } from '@/hooks/use-session-state'
import { createSwipeHandlers } from '@/hooks/use-swipe-handler'
import { useViewportHeight } from '@/hooks/use-viewport-height'
import { trackRouteLoad } from '@/lib/performance-monitor'

interface SearchParams {
  mode?: 'flashcards' | 'quiz' | 'exam'
}

type QuizMode = 'memorize-all' | 'review-starred' | 'quick-review'

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
  // const [quizMode, setQuizMode] = useState<QuizMode | null>(null) // Reserved for spaced repetition
  const [hasStartedQuiz, setHasStartedQuiz] = useState(false)

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

  // Track route load performance
  useEffect(() => {
    const endTracking = trackRouteLoad('app-session')
    return endTracking
  }, [])

  // Fetch lesson data
  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => await getLessonDetails({ data: Number(lessonId) }),
  })

  const cards = (lesson as any)?.cards ?? []
  const currentCard = cards[currentCardIndex]
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0
  const isLastCard = currentCardIndex === cards.length - 1

  // Navigation handlers
  const navigateToLesson = useCallback(() => {
    navigate({
      to: '/app/lessons/$lessonId',
      params: { lessonId },
    })
  }, [navigate, lessonId])

  const navigateToSummary = useCallback(
    (finalCorrect?: number, finalIncorrect?: number) => {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      navigate({
        to: '/app/lesson-summary/$lessonId',
        params: { lessonId },
        search: {
          correct: finalCorrect ?? sessionStats.correct,
          incorrect: finalIncorrect ?? sessionStats.incorrect,
          total: cards.length,
          duration,
          mode,
        },
      })
    },
    [navigate, lessonId, startTime, sessionStats, cards.length, mode],
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

  // Handle quiz mode start - MUST be before any conditional returns
  const handleStartQuiz = useCallback((_selectedMode: QuizMode) => {
    // setQuizMode(selectedMode) // Reserved for spaced repetition algorithm
    setHasStartedQuiz(true)
    setShowQuizSettings(false)
  }, [])

  // Show quiz settings sheet on mount if mode is quiz and not started
  useEffect(() => {
    if (mode === 'quiz' && !hasStartedQuiz) {
      setShowQuizSettings(true)
    }
  }, [mode, hasStartedQuiz])

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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    switch (mode) {
      case 'quiz':
        return (
          <Quiz
            card={currentCard}
            cardIndex={currentCardIndex}
            totalCards={cards.length}
            questionType="multiple-choice"
            onAnswer={(isCorrect) => handleResponse(isCorrect ? 'correct' : 'incorrect')}
          />
        )
      case 'exam':
        return (
          <Exam
            card={currentCard}
            cardIndex={currentCardIndex}
            totalCards={cards.length}
            onAnswer={(isCorrect) => handleResponse(isCorrect ? 'correct' : 'incorrect')}
          />
        )
      case 'flashcards':
      default:
        return (
          <>
            <Flashcard
              card={currentCard}
              cardIndex={currentCardIndex}
              isFlipped={isFlipped}
              cardOrientation={cardOrientation}
              cardHeight={cardHeight}
              x={swipeAnimations.x}
              rotate={swipeAnimations.rotate}
              opacity={swipeAnimations.opacity}
              backgroundColor={swipeAnimations.cardBackgroundColor}
              borderColor={swipeAnimations.cardBorderColor}
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

  return (
    <div className="min-h-screen bg-background">
      <SessionHeader
        currentIndex={currentCardIndex}
        totalCards={cards.length}
        progress={progress}
        onClose={navigateToLesson}
        onSettings={() => setShowSettings(true)}
      />

      <main className="mx-auto max-w-lg py-6 px-4">
        {mode !== 'quiz' && (
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
    </div>
  )
}
