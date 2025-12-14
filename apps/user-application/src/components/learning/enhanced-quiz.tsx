import type { LearningQuestion, LearningSession } from '@/lib/learning-mode-gamification'
import { Clock, Flame, Target, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CompactXPDisplay } from '@/components/gamification'
import { MarkdownRenderer } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { calculateLearningModeXP } from '@/lib/learning-mode-gamification'
import { cn } from '@/lib/utils'

interface EnhancedQuizProps {
  card: any
  cardIndex: number
  totalCards: number
  session: Partial<LearningSession>
  onAnswer: (isCorrect: boolean, timeSpent: number, attempts: number) => void
  onXPEarned?: (xp: number, breakdown: any) => void
}

type QuestionState = 'answering' | 'feedback' | 'completed'

export function EnhancedQuiz({
  card,
  cardIndex,
  totalCards,
  session,
  onAnswer,
  onXPEarned,
}: EnhancedQuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [questionState, setQuestionState] = useState<QuestionState>('answering')
  const [startTime] = useState(Date.now())
  const [attempts, setAttempts] = useState(0)
  const [showXPFeedback, setShowXPFeedback] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [combo, setCombo] = useState(session.currentCombo || 0)

  // Refs for auto-scroll functionality
  const feedbackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate quiz options (stable across re-renders to maintain position)
  const correctAnswer = card?.backContent || card?.back || 'Réponse correcte'
  const [shuffledOptions] = useState(() => {
    const opts = [
      correctAnswer,
      'Option incorrecte A',
      'Option incorrecte B',
      'Option incorrecte C',
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
    if (questionState === 'feedback' && selectedAnswer !== correctIndex && feedbackRef.current) {
      // Scroll to feedback with smooth animation
      feedbackRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    }
  }, [questionState, selectedAnswer, correctIndex])

  // Auto-scroll to top when moving to next card after wrong answer
  useEffect(() => {
    if (questionState === 'completed' && selectedAnswer !== correctIndex) {
      // Scroll to top of container for next card
      const timeoutId = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [questionState, selectedAnswer, correctIndex])

  const handleContinue = useCallback(() => {
    const isCorrect = selectedAnswer === correctIndex
    const timeSpent = (Date.now() - startTime) / 1000
    setQuestionState('completed')
    onAnswer(isCorrect, timeSpent, attempts)
  }, [selectedAnswer, correctIndex, startTime, attempts, onAnswer])

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (questionState !== 'answering')
      return

    setSelectedAnswer(answerIndex)
    setAttempts(prev => prev + 1)

    const isCorrect = answerIndex === correctIndex
    const timeSpent = (Date.now() - startTime) / 1000

    // Update combo
    const newCombo = isCorrect ? combo + 1 : 0
    setCombo(newCombo)

    // Calculate XP for this question
    const questionData: LearningQuestion = {
      id: card?.id || cardIndex,
      difficulty: timeSpent < 10 ? 'easy' : timeSpent < 20 ? 'medium' : 'hard',
      timeSpent,
      attempts,
      isCorrect,
      responseTime: timeSpent,
      questionType: 'multiple-choice',
    }

    const sessionData: LearningSession = {
      mode: 'quiz',
      streakDays: session.streakDays || 0,
      currentCombo: newCombo,
      totalQuestions: totalCards,
      correctAnswers: (session.correctAnswers || 0) + (isCorrect ? 1 : 0),
      incorrectAnswers: (session.incorrectAnswers || 0) + (isCorrect ? 0 : 1),
      sessionStartTime: session.sessionStartTime || new Date(),
      averageTimePerQuestion: timeSpent,
      perfectAnswers: attempts === 1 && isCorrect ? (session.perfectAnswers || 0) + 1 : (session.perfectAnswers || 0),
      struggledAnswers: attempts > 1 || timeSpent > 20 ? (session.struggledAnswers || 0) + 1 : (session.struggledAnswers || 0),
    }

    const xpResult = calculateLearningModeXP(sessionData, [questionData])

    if (isCorrect && xpResult.totalXP > 0) {
      setEarnedXP(xpResult.totalXP)
      setShowXPFeedback(true)
      onXPEarned?.(xpResult.totalXP, xpResult)
    }

    setQuestionState('feedback')

    // Auto-advance only for correct answers
    if (isCorrect) {
      if (timeoutRef.current)
        clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setQuestionState('completed')
        onAnswer(isCorrect, timeSpent, attempts)
      }, 1500)
    }
    // For incorrect answers, wait for user to click Continue button
  }, [questionState, correctIndex, startTime, attempts, combo, card, cardIndex, totalCards, session, onAnswer, onXPEarned])

  const getOptionStyle = (index: number) => {
    if (questionState === 'answering') {
      return selectedAnswer === index
        ? 'border-primary bg-primary'
        : 'border-border hover:border-primary/50 hover:bg-accent/50'
    }

    if (index === correctIndex) {
      return 'border-success bg-success text-success'
    }

    if (selectedAnswer === index && index !== correctIndex) {
      return 'border-error bg-error text-error'
    }

    return 'border-border'
  }

  // No icons needed - using background colors instead

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Progress and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Target className="w-3 h-3" />
            {cardIndex + 1}
            /
            {totalCards}
          </Badge>
          {combo > 0 && (
            <Badge className="gap-1 bg-streak text-streak border-streak/20">
              <Flame className="w-3 h-3" />
              Combo x
              {combo}
            </Badge>
          )}
        </div>

        {showXPFeedback && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <CompactXPDisplay xp={earnedXP} />
          </motion.div>
        )}
      </div>

      {/* Question Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                Quiz
              </Badge>
              <Badge variant="outline" className="gap-1 bg-success text-success border-success/20">
                <Zap className="w-3 h-3" />
                10 XP par bonne réponse
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
                key={`${option.slice(0, 20)}}`}
                type="button"
                onClick={() => handleAnswerSelect(index)}
                disabled={questionState !== 'answering'}
                className={cn(
                  'w-full p-4 rounded-lg border-2 text-left transition-all',
                  'flex items-center justify-between group',
                  getOptionStyle(index),
                )}
                whileHover={questionState === 'answering' ? { scale: 1.02 } : {}}
                whileTap={questionState === 'answering' ? { scale: 0.98 } : {}}
              >
                <span className="flex-1">
                  <MarkdownRenderer content={option} compact />
                </span>
              </motion.button>
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {questionState === 'feedback' && (
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
                        <div className="w-6 h-6 rounded-full bg-success border border-success/20 flex items-center justify-center">
                          <span className="text-success text-sm font-bold">✓</span>
                        </div>
                        <div>
                          <p className="font-semibold">Correct !</p>
                          <p className="text-sm opacity-80">
                            {attempts === 1 ? 'Excellente réponse du premier coup !' : 'Bonne réponse !'}
                          </p>
                        </div>
                      </div>
                    )
                  : (
                      <div className="flex items-center gap-3 text-error">
                        <div className="w-6 h-6 rounded-full bg-error border border-error/20 flex items-center justify-center">
                          <span className="text-error text-sm font-bold">✗</span>
                        </div>
                        <div>
                          <p className="font-semibold">Incorrect</p>
                          <p className="text-sm opacity-80">
                            La bonne réponse était :
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

      {/* Quiz Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium">
            {Math.round(((cardIndex + 1) / totalCards) * 100)}
            %
          </span>
        </div>
        <Progress value={((cardIndex + 1) / totalCards) * 100} className="h-2" />
      </div>

      {/* Continue Button - Only show for incorrect answers */}
      {questionState === 'feedback' && selectedAnswer !== correctIndex && (
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
