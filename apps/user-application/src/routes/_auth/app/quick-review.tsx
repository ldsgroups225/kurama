import type { Reward } from '@/components/gamification'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, SlidersHorizontal, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { RewardAnimation } from '@/components/gamification'
import { FlashcardFace } from '@/components/learning/flashcard-face'
import { SessionControls } from '@/components/learning/session-controls'
import { SessionCounterBadge } from '@/components/learning/session-counter-badge'
import { SessionSettingsDialog } from '@/components/learning/session-settings-dialog'
import { AppHeader } from '@/components/main'
import { Button } from '@/components/ui/button'
import { LogoLoader } from '@/components/ui/logo-loader'
import { getCardsForReview } from '@/core/functions/review'
import { useAutoplay } from '@/hooks/use-autoplay'
import { useCardHeight } from '@/hooks/use-card-height'
import { useCardSwipeAnimations } from '@/hooks/use-card-swipe-animations'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useSessionState } from '@/hooks/use-session-state'
import { useStatsUpdate } from '@/hooks/use-stats-update'
import { createSwipeHandlers } from '@/hooks/use-swipe-handler'
import { useViewportHeight } from '@/hooks/use-viewport-height'
import { trackRouteLoad } from '@/lib/performance-monitor'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/app/quick-review')({
  component: QuickReviewPage,
})

function QuickReviewPage() {
  const navigate = useNavigate()

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
  const pendingMutations = 0

  // Reward animation state
  const [showReward, setShowReward] = useState(false)
  const [currentReward, setCurrentReward] = useState<Reward | null>(null)

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

  useEffect(() => {
    const endTracking = trackRouteLoad('quick-review')
    return endTracking
  }, [])

  const { data: reviewData, isLoading, refetch } = useQuery({
    queryKey: ['review-cards'],
    queryFn: () => getCardsForReview({ data: { limit: 20 } }),
    staleTime: 0, // Always fetch fresh data
  })

  const cards = reviewData?.cards ?? []
  const currentCard = cards[currentCardIndex]
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0
  const isLastCard = currentCardIndex === cards.length - 1

  const navigateBack = useCallback(() => {
    navigate({ to: '/app' })
  }, [navigate])

  const navigateToSummary = useCallback(
    async (finalCorrect?: number, finalIncorrect?: number) => {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      const correct = finalCorrect ?? sessionStats.correct
      const incorrect = finalIncorrect ?? sessionStats.incorrect
      const totalCards = cards.length

      // Use first card's lesson for stats (or 0 for mixed review)
      const lessonId = cards[0]?.lessonId ?? 0

      if (lessonId > 0) {
        await updateStats({
          lessonId,
          correctCount: correct,
          totalCount: totalCards,
          duration,
          mode: 'quick-review',
        })
      }

      navigate({
        to: '/app/lesson-summary/$lessonId',
        params: { lessonId: String(lessonId || 'review') },
        search: {
          correct,
          incorrect,
          total: totalCards,
          duration,
          mode: 'quick-review',
          xpEarned: correct * 10,
        },
      })
    },
    [navigate, startTime, sessionStats, cards, updateStats],
  )

  const handleFlip = useCallback(() => {
    if (!isDragging) {
      setIsFlipped(prev => !prev)
    }
  }, [isDragging, setIsFlipped])

  const handleResponse = useCallback(
    (response: 'correct' | 'incorrect') => {
      incrementStat(response)

      if (isLastCard) {
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
    refetch()
  }, [resetSession, setShowSettings, swipeAnimations.x, refetch])

  const { handleDragStart, handleDragEnd } = createSwipeHandlers({
    x: swipeAnimations.x,
    onCorrect: () => handleResponse('correct'),
    onIncorrect: () => handleResponse('incorrect'),
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
  })

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

  // EMPTY - No cards to review
  if (!cards.length) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader title="Révision Rapide" showAvatar={false} className="bg-transparent/0 border-none" />
        <div className="flex flex-col items-center justify-center px-6 pt-20">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <Brain className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Tout est révisé !</h2>
          <p className="text-muted-foreground text-center mb-8">
            Vous n'avez pas de cartes à réviser pour le moment. Continuez à étudier pour débloquer plus de contenu.
          </p>
          <Button onClick={navigateBack} className="w-full max-w-xs">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  const frontContent = cardOrientation === 'term' ? currentCard?.frontContent ?? '' : currentCard?.backContent ?? ''
  const backContent = cardOrientation === 'term' ? currentCard?.backContent ?? '' : currentCard?.frontContent ?? ''
  const frontLabel = cardOrientation === 'term' ? 'Terme' : 'Définition'
  const backLabel = cardOrientation === 'term' ? 'Définition' : 'Terme'

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[20%] w-[60%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={navigateBack}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-foreground">Révision Rapide</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {currentCardIndex + 1}
            {' '}
            /
            {' '}
            {cards.length}
          </span>
          {/* Progress dots */}
          <div className="flex gap-1 mt-1">
            {cards.slice(0, Math.min(cards.length, 10)).map((_, i) => (
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

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </header>

      {/* Progress Line */}
      <div className="w-full h-px bg-muted relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-violet-500 shadow-glow-violet"
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
        {/* Card source info */}
        {currentCard && (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-muted/50 border border-border">
              {currentCard.subjectName}
            </span>
            <span>•</span>
            <span className="truncate max-w-[150px]">{currentCard.lessonTitle}</span>
          </div>
        )}

        {/* Session counters */}
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

        {/* Flashcard */}
        <div
          className="relative mx-4 flex items-center justify-center"
          style={{ height: `${cardHeight}px` }}
        >
          <motion.div
            key={currentCardIndex}
            style={{
              x: swipeAnimations.x,
              rotate: swipeAnimations.rotate,
              opacity: swipeAnimations.opacity,
            }}
            drag="x"
            dragConstraints={{ left: -250, right: 250 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            className="absolute inset-0 touch-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative h-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <FlashcardFace
                content={frontContent}
                label={frontLabel}
                backgroundColor={swipeAnimations.cardBackgroundColor as any}
                borderColor={swipeAnimations.cardBorderColor as any}
                onFlip={handleFlip}
              />

              <FlashcardFace
                content={backContent}
                label={backLabel}
                isBack
                backgroundColor={swipeAnimations.cardBackgroundColor as any}
                borderColor={swipeAnimations.cardBorderColor as any}
                onFlip={handleFlip}
              />
            </motion.div>
          </motion.div>
        </div>

        <SessionControls
          isAutoPlaying={isAutoPlaying}
          canGoBack={sessionStats.correct + sessionStats.incorrect > 0}
          onToggleAutoPlay={() => setIsAutoPlaying(prev => !prev)}
          onPrevCard={handlePrevCard}
        />
      </main>

      <SessionSettingsDialog
        open={showSettings}
        cardOrientation={cardOrientation}
        onOpenChange={setShowSettings}
        onOrientationChange={setCardOrientation}
        onReset={handleResetSession}
      />

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
