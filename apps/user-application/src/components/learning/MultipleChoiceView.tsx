import type { LearningCardProps } from './types'
import { CheckCircle2, Star, Volume2, XCircle } from 'lucide-react'

import { useState } from 'react'

import { MarkdownRenderer } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type QuestionState = 'answering' | 'correct' | 'incorrect' | 'learning'

export function MultipleChoiceView({ card, cardIndex, totalCards, onAnswer }: LearningCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [questionState, setQuestionState] = useState<QuestionState>('answering')
  const [showAnswer, setShowAnswer] = useState(false)

  const options = card.options || []
  const correctAnswer = card.options?.find(o => o.isCorrect)?.text || card.backContent

  const handleOptionSelect = (index: number) => {
    if (questionState !== 'answering')
      return

    if (!options)
      return
    const option = options[index]
    if (!option)
      return

    setSelectedAnswer(index)
    const isCorrect = option.isCorrect

    if (isCorrect) {
      setQuestionState('correct')
      setTimeout(() => onAnswer(true), 800)
    }
    else {
      setQuestionState('incorrect')
      setShowAnswer(true)
    }
  }

  const handleContinue = () => {
    onAnswer(questionState === 'correct')
  }

  const handleDontKnow = () => {
    setQuestionState('learning')
    setShowAnswer(true)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <Badge variant="outline" className="gap-1.5">
          <span className="font-semibold text-primary">{cardIndex + 1}</span>
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
                content={card.question || card.frontContent}
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

          <div className="space-y-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrect = option.isCorrect
              const showCorrectState = questionState !== 'answering' && isCorrect
              const showIncorrectState = questionState !== 'answering' && isSelected && !isCorrect

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(index)}
                  disabled={questionState !== 'answering'}
                  className={cn(
                    `w-full rounded-lg border-2 p-4 text-left transition-all duration-200`,
                    questionState === 'answering' && !isSelected && 'border-border hover:border-primary/50 hover:bg-accent',
                    questionState === 'answering' && isSelected && 'border-primary bg-primary/5',
                    showCorrectState && 'border-success bg-success text-success',
                    showIncorrectState && 'border-error bg-error text-error',
                    questionState !== 'answering' && 'cursor-default',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      `flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-colors`,
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
                          : String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 font-medium">
                      <MarkdownRenderer
                        content={option.text}
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
            <Button variant="ghost" className="w-full mt-4 text-muted-foreground" onClick={handleDontKnow}>
              Je ne sais pas
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Feedback Card */}
      {questionState !== 'answering' && (
        <Card className={cn('border-2', questionState === 'correct' ? 'border-success bg-success' : 'border-warning bg-warning',
        )}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {questionState === 'correct'
                  ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="font-semibold text-success">Correct !</span>
                    </>
                  )
                  : (
                    <>
                      <XCircle className="h-5 w-5 text-error" />
                      <span className="font-semibold text-error">Pas tout à fait...</span>
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
                  {card.explanation && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <MarkdownRenderer
                        content={card.explanation}
                        compact
                        className="[&_p]:my-0 [&_p]:text-muted-foreground [&_p]:text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      {(questionState === 'incorrect' || questionState === 'learning') && (
        <Button size="lg" className="w-full bg-gradient-xp text-lg font-semibold" onClick={handleContinue}>
          Continuer
        </Button>
      )}
    </div>
  )
}
