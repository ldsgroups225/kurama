import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ExamProps {
  card: any
  cardIndex: number
  totalCards: number
  timeRemaining?: number
  onAnswer: (isCorrect: boolean) => void
}

export function Exam({ card, cardIndex, totalCards, timeRemaining, onAnswer }: ExamProps) {
  if (!card) {
    return null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Timer Badge */}
      {timeRemaining !== undefined && (
        <div className="flex justify-center">
          <Badge variant="outline" className="gap-2 px-4 py-2 text-base">
            <Clock className="h-4 w-4" />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </Badge>
        </div>
      )}

      <Card className="border-2 border-streak">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Question {cardIndex + 1} / {totalCards}
            </span>
            <Badge variant="secondary" className="bg-gradient-streak text-white">
              Mode Examen
            </Badge>
          </div>

          <h3 className="mb-6 text-xl font-semibold">{card.front}</h3>

          <div className="space-y-3">
            {/* For now, we'll show the answer as a single option */}
            {/* In a real implementation, you'd have multiple choice options */}
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-4 px-4"
              onClick={() => onAnswer(true)}
            >
              <span className="flex-1">{card.back}</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-4 px-4"
              onClick={() => onAnswer(false)}
            >
              <span className="flex-1">Autre réponse (incorrect)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          size="lg"
          variant="outline"
          className="flex-1 gap-2 border-2 border-error text-error hover:bg-error hover:text-white"
          onClick={() => onAnswer(false)}
        >
          <XCircle className="h-5 w-5" />
          Incorrect
        </Button>

        <Button
          size="lg"
          className="flex-1 gap-2 bg-gradient-success"
          onClick={() => onAnswer(true)}
        >
          <CheckCircle2 className="h-5 w-5" />
          Correct
        </Button>
      </div>
    </div>
  )
}
