import type { LearningQuestion, LearningSession } from '@/lib/learning-mode-gamification'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock, Flame, Target, XCircle, Zap } from 'lucide-react'
import { useCallback, useState } from 'react'
import { CompactXPDisplay } from '@/components/gamification'
import { MarkdownRenderer } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
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

  // Generate quiz options (in real app, these would come from the database)
  const correctAnswer = card?.backContent || card?.back || 'Réponse correcte'
  const options = [
    correctAnswer,
    'Option incorrecte A',
    'Option incorrecte B',
    'Option incorrecte C',
  ].sort(() => Math.random() - 0.5) // Shuffle options

  const correctIndex = options.indexOf(correctAnswer)
  const question = card?.frontContent || card?.front || 'Question'

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

    // Auto-advance after showing feedback
    setTimeout(() => {
      setQuestionState('completed')
      onAnswer(isCorrect, timeSpent, attempts)
    }, isCorrect ? 1500 : 2500)
  }, [questionState, correctIndex, startTime, attempts, combo, card, cardIndex, totalCards, session, onAnswer, onXPEarned])

  const getOptionStyle = (index: number) => {
    if (questionState === 'answering') {
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

  const getOptionIcon = (index: number) => {
    if (questionState === 'answering')
      return null

    if (index === correctIndex) {
      return <CheckCircle2 className="w-5 h-5 text-success" />
    }

    if (selectedAnswer === index && index !== correctIndex) {
      return <XCircle className="w-5 h-5 text-error" />
    }

    return null
  }

  return (
    <div className="space-y-6">
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
            <Badge className="gap-1 bg-streak/10 text-streak border-streak/20">
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
              <Badge variant="outline" className="gap-1 bg-quiz/10 text-quiz border-quiz/20">
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
            {options.map((option, index) => (
              <motion.button
                key={index}
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

                <AnimatePresence>
                  {getOptionIcon(index) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {getOptionIcon(index)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {questionState === 'feedback' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 p-4 rounded-lg border"
              >
                {selectedAnswer === correctIndex
                  ? (
                      <div className="flex items-center gap-3 text-success">
                        <CheckCircle2 className="w-6 h-6" />
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
                        <XCircle className="w-6 h-6" />
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
    </div>
  )
}
