import type { LearningQuestion, LearningSession } from '@/lib/learning-mode-gamification'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Clock, FileText, Flame, Timer, Zap } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CompactXPDisplay } from '@/components/gamification'
import { MarkdownRenderer } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { calculateLearningModeXP } from '@/lib/learning-mode-gamification'
import { cn } from '@/lib/utils'

interface EnhancedExamProps {
  card: any
  cardIndex: number
  totalCards: number
  timeLimit?: number // in seconds
  session: Partial<LearningSession>
  onAnswer: (isCorrect: boolean, timeSpent: number, attempts: number) => void
  onTimeUp?: () => void
  onXPEarned?: (xp: number, breakdown: any) => void
}

type ExamState = 'answering' | 'feedback' | 'completed'

export function EnhancedExam({
  card,
  cardIndex,
  totalCards,
  timeLimit = 60,
  session,
  onAnswer,
  onTimeUp,
  onXPEarned,
}: EnhancedExamProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [examState, setExamState] = useState<ExamState>('answering')
  const [startTime] = useState(Date.now())
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [attempts, setAttempts] = useState(0)
  const [showXPFeedback, setShowXPFeedback] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [combo, setCombo] = useState(session.currentCombo || 0)
  const [isUnderPressure, setIsUnderPressure] = useState(false)

  // Refs for auto-scroll functionality
  const feedbackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Timer effect
  useEffect(() => {
    if (examState !== 'answering')
      return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeUp?.()
          return 0
        }

        // Mark as under pressure when less than 25% time remaining
        if (prev <= timeLimit * 0.25) {
          setIsUnderPressure(true)
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examState, timeLimit, onTimeUp])

  // Generate exam options (stable across re-renders to maintain position)
  const correctAnswer = card?.backContent || card?.back || 'Réponse correcte'
  const [shuffledOptions] = useState(() => {
    const opts = [
      correctAnswer,
      'Option plausible A',
      'Option plausible B',
      'Option plausible C',
    ]
    // Shuffle once and keep stable
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]]
    }
    return opts
  })

  const correctIndex = shuffledOptions.indexOf(correctAnswer)
  const question = card?.frontContent || card?.front || 'Question'

  // Auto-scroll to feedback on incorrect answer
  useEffect(() => {
    if (examState === 'feedback' && selectedAnswer !== correctIndex && feedbackRef.current) {
      // Scroll to feedback with smooth animation
      feedbackRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    }
  }, [examState, selectedAnswer, correctIndex])

  // Auto-scroll to top when moving to next card after wrong answer
  useEffect(() => {
    if (examState === 'completed' && selectedAnswer !== correctIndex) {
      // Scroll to top of container for next card
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }, [examState, selectedAnswer, correctIndex])

  const handleContinue = useCallback(() => {
    const isCorrect = selectedAnswer === correctIndex
    const timeUsed = timeLimit - timeRemaining
    setExamState('completed')
    onAnswer(isCorrect, timeUsed, attempts)
  }, [selectedAnswer, correctIndex, timeLimit, timeRemaining, attempts, onAnswer])

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (examState !== 'answering')
      return

    setSelectedAnswer(answerIndex)
    setAttempts(prev => prev + 1)

    const isCorrect = answerIndex === correctIndex
    const timeUsed = timeLimit - timeRemaining

    // Update combo
    const newCombo = isCorrect ? combo + 1 : 0
    setCombo(newCombo)

    // Calculate XP for this question (exam mode gets higher rewards)
    const questionData: LearningQuestion = {
      id: card?.id || cardIndex,
      difficulty: timeUsed < timeLimit * 0.3 ? 'easy' : timeUsed < timeLimit * 0.7 ? 'medium' : 'hard',
      timeSpent: timeUsed,
      attempts: attempts + 1,
      isCorrect,
      responseTime: timeUsed,
      questionType: 'multiple-choice',
    }

    const sessionData: LearningSession = {
      mode: 'exam',
      streakDays: session.streakDays || 0,
      currentCombo: newCombo,
      totalQuestions: totalCards,
      correctAnswers: (session.correctAnswers || 0) + (isCorrect ? 1 : 0),
      incorrectAnswers: (session.incorrectAnswers || 0) + (isCorrect ? 0 : 1),
      sessionStartTime: session.sessionStartTime || new Date(),
      averageTimePerQuestion: timeUsed,
      perfectAnswers: attempts === 1 && isCorrect ? (session.perfectAnswers || 0) + 1 : (session.perfectAnswers || 0),
      struggledAnswers: attempts > 1 || timeUsed > timeLimit * 0.8 ? (session.struggledAnswers || 0) + 1 : (session.struggledAnswers || 0),
    }

    const xpResult = calculateLearningModeXP(sessionData, [questionData])

    // Exam pressure bonus
    let pressureBonus = 0
    if (isCorrect && isUnderPressure) {
      pressureBonus = 25
    }

    const totalXP = xpResult.totalXP + pressureBonus

    if (isCorrect && totalXP > 0) {
      setEarnedXP(totalXP)
      setShowXPFeedback(true)
      onXPEarned?.(totalXP, { ...xpResult, pressureBonus })
    }

    setExamState('feedback')

    // Auto-advance only for correct answers (shorter time in exam mode)
    if (isCorrect) {
      setTimeout(() => {
        setExamState('completed')
        onAnswer(isCorrect, timeUsed, attempts)
      }, 1000)
    }
    // For incorrect answers, wait for user to click Continue button
  }, [examState, correctIndex, startTime, timeLimit, timeRemaining, attempts, combo, isUnderPressure, card, cardIndex, totalCards, session, onAnswer, onXPEarned])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeRemaining <= timeLimit * 0.1)
      return 'text-error'
    if (timeRemaining <= timeLimit * 0.25)
      return 'text-warning'
    return 'text-foreground'
  }

  const getOptionStyle = (index: number) => {
    if (examState === 'answering') {
      return selectedAnswer === index
        ? 'border-primary bg-primary/10'
        : 'border-border hover:border-primary/50 hover:bg-accent/50'
    }

    if (index === correctIndex) {
      return 'border-success bg-success/10 text-success'
    }

    if (selectedAnswer === index && index !== correctIndex) {
      return 'border-error bg-error/10 text-error'
    }

    return 'border-border bg-muted/30'
  }

  // No icons needed - using background colors instead

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Exam Header with Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1 bg-info/10 text-info border-info/20">
            <FileText className="w-3 h-3" />
            Examen
            {' '}
            {cardIndex + 1}
            /
            {totalCards}
          </Badge>
          {combo > 0 && (
            <Badge className="gap-1 bg-streak/10 text-streak border-streak/20">
              <Flame className="w-3 h-3" />
              Série x
              {combo}
            </Badge>
          )}
          {isUnderPressure && (
            <Badge className="gap-1 bg-warning/10 text-warning border-warning/20">
              <AlertTriangle className="w-3 h-3" />
              Sous pression
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showXPFeedback && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <CompactXPDisplay xp={earnedXP} />
            </motion.div>
          )}

          <div className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full border',
            getTimeColor(),
            timeRemaining <= timeLimit * 0.1 && 'bg-error/10 border-error/20',
            timeRemaining <= timeLimit * 0.25 && timeRemaining > timeLimit * 0.1 && 'bg-warning/10 border-warning/20',
          )}
          >
            <Timer className="w-4 h-4" />
            <span className="font-mono font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="overflow-hidden border-info/20">
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                Mode Examen
              </Badge>
              <Badge variant="outline" className="gap-1 bg-legendary/10 text-legendary border-legendary/20">
                <Zap className="w-3 h-3" />
                12 XP + bonus pression
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-4">
              <MarkdownRenderer content={question} compact />
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {shuffledOptions.map((option, index) => (
              <motion.button
                key={index}
                type="button"
                onClick={() => handleAnswerSelect(index)}
                disabled={examState !== 'answering'}
                className={cn(
                  'w-full p-4 rounded-lg border-2 text-left transition-all',
                  'flex items-center justify-between group',
                  getOptionStyle(index),
                )}
                whileHover={examState === 'answering' ? { scale: 1.01 } : {}}
                whileTap={examState === 'answering' ? { scale: 0.99 } : {}}
              >
                <span className="flex-1">
                  <MarkdownRenderer content={option} compact />
                </span>
              </motion.button>
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {examState === 'feedback' && (
              <motion.div
                ref={feedbackRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 p-4 rounded-lg border"
              >
                {selectedAnswer === correctIndex
                  ? (
                    <div className="flex items-center gap-3 text-success">
                      <div className="w-6 h-6 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
                        <span className="text-success text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold">Excellent !</p>
                        <p className="text-sm opacity-80">
                          {isUnderPressure
                            ? 'Remarquable sous pression !'
                            : attempts === 1 ? 'Réponse parfaite !' : 'Bonne réponse !'}
                        </p>
                      </div>
                    </div>
                  )
                  : (
                    <div className="flex items-center gap-3 text-error">
                      <div className="w-6 h-6 rounded-full bg-error/10 border border-error/20 flex items-center justify-center">
                        <span className="text-error text-sm font-bold">✗</span>
                      </div>
                      <div>
                        <p className="font-semibold">Incorrect</p>
                        <p className="text-sm opacity-80">
                          Réponse correcte :
                          {' '}
                          <strong>{correctAnswer}</strong>
                        </p>
                      </div>
                    </div>
                  )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Exam Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progression de l'examen</span>
          <span className="font-medium">
            {Math.round(((cardIndex + 1) / totalCards) * 100)}
            %
          </span>
        </div>
        <Progress value={((cardIndex + 1) / totalCards) * 100} className="h-3" />
      </div>

      {/* Time Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Temps restant</span>
          <span className={cn('font-mono font-medium', getTimeColor())}>
            {formatTime(timeRemaining)}
            {' '}
            /
            {formatTime(timeLimit)}
          </span>
        </div>
        <Progress
          value={(timeRemaining / timeLimit) * 100}
          className={cn(
            'h-2',
            timeRemaining <= timeLimit * 0.1 && '[&>div]:bg-error',
            timeRemaining <= timeLimit * 0.25 && timeRemaining > timeLimit * 0.1 && '[&>div]:bg-warning',
          )}
        />
      </div>

      {/* Continue Button - Only show for incorrect answers */}
      {examState === 'feedback' && selectedAnswer !== correctIndex && (
        <Button
          size="lg"
          className="w-full bg-gradient-xp text-lg font-semibold"
          onClick={handleContinue}
        >
          Continuer
        </Button>
      )}
    </div>
  )
}
