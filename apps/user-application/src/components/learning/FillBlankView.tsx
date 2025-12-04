import type { LearningCardProps } from './types'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { MarkdownRenderer } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

type QuestionState = 'answering' | 'correct' | 'incorrect' | 'learning'

export function FillBlankView({ card, cardIndex, totalCards, onAnswer }: LearningCardProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [questionState, setQuestionState] = useState<QuestionState>('answering')

  const handleSubmit = () => {
    if (!userAnswer.trim())
      return

    // Basic normalization (case insensitive, trim)
    const isCorrect = userAnswer.toLowerCase().trim() === card.correctAnswer?.toLowerCase().trim()

    if (isCorrect) {
      setQuestionState('correct')
      setTimeout(() => onAnswer(true), 800)
    }
    else {
      setQuestionState('incorrect')
    }
  }

  const handleDontKnow = () => {
    setQuestionState('learning')
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
          <div className="mb-6 flex items-start justify-between">
            <h3 className="flex-1 text-xl font-semibold leading-relaxed">
              {card.frontContent.split('___').map((part, i, arr) => (
                <span key={generateUUID()}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block w-24 border-b-2 border-primary mx-1 align-bottom"></span>
                  )}
                </span>
              ))}
            </h3>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Tapez votre réponse..."
              disabled={questionState !== 'answering'}
              className={cn(
                'w-full rounded-lg border-2 bg-background px-4 py-3 text-lg transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none',
                questionState === 'correct' && 'border-success bg-success/10',
                questionState === 'incorrect' && 'border-error bg-error/10',
              )}
            />

            {questionState === 'answering' && (
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-xp"
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                >
                  Vérifier
                </Button>
                <Button variant="ghost" onClick={handleDontKnow}>
                  Je ne sais pas
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {questionState !== 'answering' && (
        <Card className={cn('border-2', questionState === 'correct' ? 'border-success bg-success' : 'border-warning bg-warning',
        )}
        >
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {questionState === 'correct'
                  ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="font-semibold text-success">Exactement !</span>
                    </>
                  )
                  : (
                    <>
                      <XCircle className="h-5 w-5 text-error" />
                      <span className="font-semibold text-error">
                        La réponse était :
                        {card.correctAnswer}
                      </span>
                    </>
                  )}
              </div>
              {card.explanation && (
                <div className="text-sm text-muted-foreground px-7">
                  <MarkdownRenderer
                    content={card.explanation}
                    compact
                    className="[&_p]:my-0 [&_p]:text-muted-foreground [&_p]:text-sm"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(questionState === 'incorrect' || questionState === 'learning') && (
        <Button size="lg" className="w-full bg-gradient-xp text-lg font-semibold" onClick={handleContinue}>
          Continuer
        </Button>
      )}
    </div>
  )
}
