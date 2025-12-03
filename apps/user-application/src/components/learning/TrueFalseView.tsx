import type { LearningCardProps } from './types'
import { CheckCircle2, Volume2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type QuestionState = 'answering' | 'correct' | 'incorrect'

export function TrueFalseView({ card, cardIndex, totalCards, onAnswer }: LearningCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [questionState, setQuestionState] = useState<QuestionState>('answering')

  // Expect correctAnswer to be 'true' or 'false' string from DB
  const isTrueCorrect = card.correctAnswer === 'true'

  const handleSelect = (value: boolean) => {
    if (questionState !== 'answering')
      return

    setSelectedAnswer(value)
    const isCorrect = value === isTrueCorrect

    if (isCorrect) {
      setQuestionState('correct')
      setTimeout(() => onAnswer(true), 800)
    }
    else {
      setQuestionState('incorrect')
    }
  }

  const handleContinue = () => {
    onAnswer(questionState === 'correct')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between text-sm">
        <Badge variant="outline" className="gap-1.5">
          <span className="font-semibold text-primary">{cardIndex + 1}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{totalCards}</span>
        </Badge>
      </div>

      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="mb-8 flex items-start justify-between">
            <h3 className="flex-1 text-xl font-semibold text-center">
              {card.frontContent}
            </h3>
            <div className="absolute right-6 top-6 flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className={cn(
                'h-32 text-2xl font-bold border-2 hover:bg-success/10 hover:text-success hover:border-success',
                selectedAnswer === true && 'bg-success/20 border-success text-success',
                questionState === 'correct' && isTrueCorrect && 'bg-success text-white border-success',
                questionState === 'incorrect' && selectedAnswer === true && 'bg-error text-white border-error',
              )}
              onClick={() => handleSelect(true)}
              disabled={questionState !== 'answering'}
            >
              Vrai
            </Button>
            <Button
              variant="outline"
              className={cn(
                'h-32 text-2xl font-bold border-2 hover:bg-error/10 hover:text-error hover:border-error',
                selectedAnswer === false && 'bg-error/20 border-error text-error',
                questionState === 'correct' && !isTrueCorrect && 'bg-success text-white border-success', // If False is correct
                questionState === 'incorrect' && selectedAnswer === false && 'bg-error text-white border-error',
              )}
              onClick={() => handleSelect(false)}
              disabled={questionState !== 'answering'}
            >
              Faux
            </Button>
          </div>
        </CardContent>
      </Card>

      {questionState !== 'answering' && (
        <Card className={cn('border-2', questionState === 'correct' ? 'border-success bg-success' : 'border-warning bg-warning',
        )}
        >
          <CardContent className="p-4">
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
                    <span className="font-semibold text-error">
                      Faux. La réponse était
                      {' '}
                      {isTrueCorrect ? 'Vrai' : 'Faux'}
                      .
                    </span>
                  </>
                )}
            </div>
            {card.explanation && (
              <p className="mt-2 text-sm text-muted-foreground px-7">{card.explanation}</p>
            )}
          </CardContent>
        </Card>
      )}

      {(questionState === 'incorrect') && (
        <Button size="lg" className="w-full bg-gradient-xp text-lg font-semibold" onClick={handleContinue}>
          Continuer
        </Button>
      )}
    </div>
  )
}
