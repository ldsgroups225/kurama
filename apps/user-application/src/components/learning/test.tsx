import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TestProps {
  card: any
  cardIndex: number
  totalCards: number
  questionType: 'multiple-choice' | 'written' | 'true-false'
  answerWith: 'term' | 'definition' | 'both'
  cardSide?: 'term' | 'definition'
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
}

export function Test({
  card,
  cardIndex,
  totalCards,
  questionType,
  // eslint-disable-next-line ts/no-unused-vars
  answerWith: _answerWith,
  cardSide = 'term',
  onAnswer,
}: TestProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)

  // Determine which side to show based on cardSide setting
  const showSide = cardSide === 'term' ? 'term' : 'definition'
  const question = showSide === 'term' ? card?.frontContent || card?.front : card?.backContent || card?.back
  const correctAnswer = showSide === 'term' ? card?.backContent || card?.back : card?.frontContent || card?.front

  // Memoize shuffled options for multiple choice
  // eslint-disable react-hooks/purity
  const options = useMemo(() => {
    if (questionType !== 'multiple-choice' || !correctAnswer)
      return []

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
  }, [correctAnswer, questionType])

  if (!card) {
    return null
  }

  const handleOptionSelect = (index: number) => {
    if (isAnswered)
      return

    setSelectedAnswer(index)
    setIsAnswered(true)

    const isCorrect = options[index] === correctAnswer

    // Auto-advance with natural delay (100ms)
    setTimeout(() => {
      onAnswer(isCorrect, options[index])
    }, 100)
  }

  const handleTrueFalseSelect = (answer: boolean) => {
    if (isAnswered)
      return

    setIsAnswered(true)

    // For true/false, we'll consider the statement as "true" if it matches
    // In a real implementation, you'd have a proper true/false flag in the data
    const isCorrect = answer === true

    // Auto-advance with natural delay (100ms)
    setTimeout(() => {
      onAnswer(isCorrect, answer ? 'Vrai' : 'Faux')
    }, 100)
  }

  const handleWrittenSubmit = () => {
    if (isAnswered || !userAnswer.trim())
      return

    setIsAnswered(true)

    // Simple comparison - in production, use fuzzy matching
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()

    // Auto-advance with natural delay (150ms for written)
    setTimeout(() => {
      onAnswer(isCorrect, userAnswer)
    }, 150)
  }

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {options.map((option) => {
        const optionIndex = options.indexOf(option)
        const isSelected = selectedAnswer === optionIndex

        return (
          <motion.button
            key={`${option}-${optionIndex}`}
            type="button"
            onClick={() => handleOptionSelect(optionIndex)}
            disabled={isAnswered}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: optionIndex * 0.05 }}
            className={cn(
              `
                w-full rounded-lg border-2 p-4 text-left transition-all
                duration-150
              `,
              !isAnswered && 'hover:border-primary/50 hover:bg-accent',
              isSelected && 'border-primary bg-primary/5',
              !isSelected && !isAnswered && 'border-border',
              isAnswered && 'cursor-default opacity-75',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  `
                    flex h-8 w-8 shrink-0 items-center justify-center
                    rounded-full border-2 font-semibold transition-colors
                  `,
                  !isAnswered && !isSelected && 'border-border bg-background',
                  isSelected && 'border-primary bg-primary text-primary-foreground',
                )}
              >
                {String.fromCharCode(65 + optionIndex)}
              </div>
              <span className="flex-1 font-medium">{option}</span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )

  const renderTrueFalse = () => (
    <div className="grid grid-cols-2 gap-4">
      <motion.button
        type="button"
        onClick={() => handleTrueFalseSelect(true)}
        disabled={isAnswered}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          `
            rounded-lg border-2 p-6 text-center transition-all
            duration-150
          `,
          !isAnswered && 'hover:border-success/50 hover:bg-success/5',
          'border-border',
          isAnswered && 'cursor-default opacity-75',
        )}
      >
        <div className="text-2xl font-bold">Vrai</div>
      </motion.button>

      <motion.button
        type="button"
        onClick={() => handleTrueFalseSelect(false)}
        disabled={isAnswered}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className={cn(
          `
            rounded-lg border-2 p-6 text-center transition-all
            duration-150
          `,
          !isAnswered && 'hover:border-error/50 hover:bg-error/5',
          'border-border',
          isAnswered && 'cursor-default opacity-75',
        )}
      >
        <div className="text-2xl font-bold">Faux</div>
      </motion.button>
    </div>
  )

  const renderWritten = () => (
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground">
        Choisissez la bonne réponse
      </div>
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
        disabled={isAnswered}
        className={cn(
          `
            w-full rounded-lg border-2 bg-background px-4 py-3 text-base
            transition-colors
            placeholder:text-muted-foreground
            focus:border-primary focus:outline-none
          `,
          isAnswered && 'opacity-75',
        )}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-streak"
        />
      </div>

      {/* Progress Counter */}
      <div className="text-center text-sm font-semibold text-muted-foreground">
        {cardIndex + 1}
        /
        {totalCards}
      </div>

      {/* Question Card */}
      <Card className="border-2">
        <CardContent className="p-6">
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-xl font-semibold"
          >
            {question}
          </motion.h3>

          {questionType === 'multiple-choice' && renderMultipleChoice()}
          {questionType === 'true-false' && renderTrueFalse()}
          {questionType === 'written' && renderWritten()}
        </CardContent>
      </Card>
    </div>
  )
}
