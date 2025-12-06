import type { LearningCardProps } from './types'
import { CheckCircle2, Volume2, XCircle } from 'lucide-react'
import { animate } from 'motion'
import { useEffect, useRef, useState } from 'react'
import { MarkdownRenderer } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type QuestionState = 'answering' | 'correct' | 'incorrect'

export function TrueFalseView({ card, cardIndex, totalCards, onAnswer }: LearningCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [questionState, setQuestionState] = useState<QuestionState>('answering')
  const scrollTargetRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to continue button when wrong answer is selected
  useEffect(() => {
    if (questionState === 'incorrect' && scrollTargetRef.current) {
      const timer = setTimeout(() => {
        const element = scrollTargetRef.current
        if (!element)
          return

        const elementRect = element.getBoundingClientRect()
        const targetScrollY = window.scrollY + elementRect.bottom - window.innerHeight + 24

        if (targetScrollY > window.scrollY) {
          animate(window.scrollY, targetScrollY, {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
            onUpdate: value => window.scrollTo(0, value),
          })
        }
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [questionState])

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
    // Scroll to top instantly before transitioning to next question
    window.scrollTo({ top: 0, behavior: 'instant' })
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
            <div className="flex-1 text-xl font-semibold text-center">
              <MarkdownRenderer
                content={card.frontContent}
                compact
                centered
                className="[&_p]:text-foreground [&_p]:my-0 [&_p]:text-xl [&_p]:font-semibold"
              />
            </div>
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
              <div className="mt-2 text-sm text-muted-foreground px-7">
                <MarkdownRenderer
                  content={card.explanation}
                  compact
                  className="[&_p]:my-0 [&_p]:text-muted-foreground [&_p]:text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(questionState === 'incorrect') && (
        <div ref={scrollTargetRef} className="pb-6">
          <Button size="lg" className="w-full bg-gradient-xp text-lg font-semibold" onClick={handleContinue}>
            Continuer
          </Button>
        </div>
      )}
    </div>
  )
}
