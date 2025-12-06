import { CheckCircle2, Star, Volume2, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MarkdownRenderer } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuizProps {
  card: any
  cardIndex: number
  totalCards: number
  questionType?: 'multiple-choice' | 'written' | 'true-false'
  onAnswer: (isCorrect: boolean) => void
}

type QuestionState = 'answering' | 'correct' | 'incorrect' | 'learning'

export function Quiz({ card, cardIndex, totalCards, questionType = 'multiple-choice', onAnswer }: QuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [questionState, setQuestionState] = useState<QuestionState>('answering')
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')

  const correctAnswer = card?.backContent || card?.back

  // Memoize shuffled options to prevent re-shuffling on re-renders
  // eslint-disable react-hooks/purity
  const options = useMemo(() => {
    if (!correctAnswer)
      return []

    // In a real implementation, you'd have actual distractors from the database
    // For now, we'll create placeholder options
    const opts = [
      correctAnswer,
      'Option incorrecte 1',
      'Option incorrecte 2',
      'Option incorrecte 3',
    ]

    // Fisher-Yates shuffle for proper randomization
    for (let i = opts.length - 1; i > 0; i--) {
      // eslint-disable-next-line react-hooks/purity
      const j = Math.floor(Math.random() * (i + 1))
        ;[opts[i], opts[j]] = [opts[j], opts[i]]
    }
    return opts
  }, [correctAnswer])

  if (!card) {
    return null
  }

  const handleOptionSelect = (index: number) => {
    if (questionState !== 'answering')
      return

    setSelectedAnswer(index)
    const isCorrect = options[index] === correctAnswer

    if (isCorrect) {
      setQuestionState('correct')
      // Auto-advance after 800ms for correct answers
      setTimeout(() => {
        onAnswer(true)
      }, 800)
    }
    else {
      setQuestionState('incorrect')
      setShowAnswer(true)
    }
  }

  const handleContinue = () => {
    const isCorrect = questionState === 'correct'
    onAnswer(isCorrect)
  }

  const handleDontKnow = () => {
    setQuestionState('learning')
    setShowAnswer(true)
  }

  const handleWrittenSubmit = () => {
    // Simple comparison - in production, use fuzzy matching
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    setQuestionState(isCorrect ? 'correct' : 'incorrect')

    if (isCorrect) {
      // Auto-advance after 800ms for correct answers
      setTimeout(() => {
        onAnswer(true)
      }, 800)
    }
    else {
      setShowAnswer(true)
    }
  }

  const renderMultipleChoice = () => (
    <>
      <div className="space-y-3">
        {options.map((option) => {
          const optionIndex = options.indexOf(option)
          const isSelected = selectedAnswer === optionIndex
          const isCorrect = option === correctAnswer
          const showCorrectState = questionState !== 'answering' && isCorrect
          const showIncorrectState = questionState !== 'answering' && isSelected && !isCorrect

          return (
            <button
              key={`${option}-${optionIndex}`}
              type="button"
              onClick={() => handleOptionSelect(optionIndex)}
              disabled={questionState !== 'answering'}
              className={cn(
                `
                  w-full rounded-lg border-2 p-4 text-left transition-all
                  duration-200
                `,
                questionState === 'answering' && !isSelected && 'border-border hover:border-primary/50 hover:bg-accent',
                questionState === 'answering' && isSelected && 'border-primary bg-primary/5',
                showCorrectState && 'border-success bg-success text-success',
                showIncorrectState && 'border-error bg-error text-error',
                questionState !== 'answering' && 'cursor-default',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    `
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-full border-2 font-semibold transition-colors
                    `,
                    questionState === 'answering' && !isSelected && 'border-border bg-background',
                    questionState === 'answering' && isSelected && 'border-primary bg-primary text-primary-foreground',
                    showCorrectState && 'border-success bg-gradient-success text-white',
                    showIncorrectState && 'border-error bg-gradient-error text-white',
                  )}
                >
                  {showCorrectState
                    ? <CheckCircle2 className="h-5 w-5" />
                    : showIncorrectState
                      ? <XCircle className="h-5 w-5" />
                      : String.fromCharCode(65 + optionIndex)}
                </div>
                <span className="flex-1 font-medium">
                  <MarkdownRenderer
                    content={option}
                    compact
                    className="[&_p]:my-0 [&_p]:text-inherit"
                  />
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {questionState === 'answering' && (
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={handleDontKnow}
        >
          Vous ne savez pas ?
        </Button>
      )}
    </>
  )

  const renderWrittenAnswer = () => (
    <>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userAnswer.trim()) {
                handleWrittenSubmit()
              }
            }}
            placeholder="Tapez la réponse"
            disabled={questionState !== 'answering'}
            className={cn(
              `
                w-full rounded-lg border-2 bg-background px-4 py-3 text-base
                transition-colors
                placeholder:text-muted-foreground
                focus:border-primary focus:outline-none
              `,
              questionState === 'correct' && 'border-success bg-success',
              questionState === 'incorrect' && 'border-error bg-error',
            )}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1/2 right-2 -translate-y-1/2 text-primary"
            onClick={handleDontKnow}
          >
            Vous ne savez pas ?
          </Button>
        </div>

        {questionState === 'answering' && userAnswer.trim() && (
          <Button
            className="w-full bg-gradient-xp"
            onClick={handleWrittenSubmit}
          >
            Vérifier
          </Button>
        )}
      </div>
    </>
  )

  const renderFeedback = () => {
    if (questionState === 'answering')
      return null

    return (
      <Card
        className={cn(
          'border-2',
          questionState === 'correct' && 'border-success bg-success',
          (questionState === 'incorrect' || questionState === 'learning') && 'border-warning bg-warning',
        )}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {questionState === 'correct'
                ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="font-semibold text-success">Vous maîtrisez le sujet !</span>
                    </>
                  )
                : questionState === 'learning'
                  ? (
                      <>
                        <span className="text-lg">📚</span>
                        <span className="font-semibold text-warning">Pas d'inquiétude, vous êtes en train d'apprendre !</span>
                      </>
                    )
                  : (
                      <>
                        <XCircle className="h-5 w-5 text-error" />
                        <span className="font-semibold text-error">Pas d'inquiétude, vous êtes en train d'apprendre !</span>
                      </>
                    )}
            </div>

            {showAnswer && (
              <div className="rounded-lg bg-background/50 p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Réponse correcte :</p>
                <div className="font-medium">
                  <MarkdownRenderer
                    content={correctAnswer}
                    compact
                    className="[&_p]:my-0 [&_p]:text-foreground"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm">
        <Badge variant="outline" className="gap-1.5">
          <span className="font-semibold text-primary">
            {cardIndex + 1}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{totalCards}</span>
        </Badge>
      </div>

      {/* Question Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1 text-xl font-semibold">
              <MarkdownRenderer
                content={card.frontContent || card.front || ''}
                compact
                className="[&_p]:text-foreground [&_p]:my-0 [&_p]:text-xl [&_p]:font-semibold"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {questionType === 'written' ? renderWrittenAnswer() : renderMultipleChoice()}
        </CardContent>
      </Card>

      {/* Feedback */}
      {renderFeedback()}

      {/* Continue Button - Only show for incorrect/learning states */}
      {(questionState === 'incorrect' || questionState === 'learning') && (
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
