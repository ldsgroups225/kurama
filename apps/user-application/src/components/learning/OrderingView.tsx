import type { OrderingCardProps } from './types'
import { CheckCircle2, GripVertical, XCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function OrderingView({ card, onAnswer }: OrderingCardProps) {
  const isFirstRender = useRef(true)
  const correctOrder = useMemo(() => card.items || [], [card.items])
  const [currentOrder, setCurrentOrder] = useState<{ id: string, text: string }[]>(() => {
    return shuffleArray(correctOrder)
  })

  // Shuffle items when card changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const timeoutId = setTimeout(() => {
      setCurrentOrder(shuffleArray(correctOrder))
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [correctOrder])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isChecked, setIsChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index)
      return

    const newOrder = [...currentOrder]
    const draggedItem = newOrder[draggedIndex]
    if (!draggedItem)
      return

    newOrder.splice(draggedIndex, 1)
    newOrder.splice(index, 0, draggedItem)

    setCurrentOrder(newOrder)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const moveUp = (index: number) => {
    if (index === 0)
      return
    const newOrder = [...currentOrder]
    const current = newOrder[index]
    const previous = newOrder[index - 1]
    if (!current || !previous) {
      return
    }
    [newOrder[index - 1], newOrder[index]] = [current, previous]
    setCurrentOrder(newOrder)
  }

  const moveDown = (index: number) => {
    if (index === currentOrder.length - 1)
      return
    const newOrder = [...currentOrder]
    const current = newOrder[index]
    const next = newOrder[index + 1]
    if (!current || !next) {
      return
    }
    [newOrder[index], newOrder[index + 1]] = [next, current]
    setCurrentOrder(newOrder)
  }

  const checkOrder = () => {
    const correct = currentOrder.every((item, idx) => {
      const correctItem = correctOrder[idx]
      return correctItem && item.id === correctItem.id
    })
    setIsCorrect(correct)
    setIsChecked(true)

    if (correct) {
      setTimeout(() => onAnswer?.(true), 1000)
    }
  }

  const reset = () => {
    const shuffled = shuffleArray(correctOrder)
    setCurrentOrder(shuffled)
    setIsChecked(false)
    setIsCorrect(false)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold">{card.frontContent}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Arrange the items in the correct order
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-3">
        {currentOrder.map((item, index) => {
          const correctIndex = correctOrder.findIndex(c => c.id === item.id)
          const isInCorrectPosition = isChecked && correctIndex === index
          const isInWrongPosition = isChecked && correctIndex !== index

          return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={item.id}
              draggable={!isChecked}
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${draggedIndex === index ? 'opacity-50' : ''
              } ${isInCorrectPosition ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''
              } ${isInWrongPosition ? 'border-destructive bg-destructive/10' : ''
              } ${!isChecked ? 'cursor-move hover:bg-accent' : ''
              }`}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />

              <span className="flex-1 font-medium">{item.text}</span>

              {!isChecked && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveDown(index)}
                    disabled={index === currentOrder.length - 1}
                  >
                    ↓
                  </Button>
                </div>
              )}

              {isInCorrectPosition && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {isInWrongPosition && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex gap-3">
        {!isChecked
          ? (
              <Button onClick={checkOrder} size="lg">
                Check Order
              </Button>
            )
          : (
              <>
                {!isCorrect && (
                  <Button onClick={reset} variant="outline" size="lg">
                    Try Again
                  </Button>
                )}
              </>
            )}
      </div>

      {isChecked && card.explanation && (
        <Card className={`mt-6 p-4 ${isCorrect
          ? 'bg-green-50 dark:bg-green-950'
          : 'bg-yellow-50 dark:bg-yellow-950'
        }`}
        >
          <p className={`text-sm ${isCorrect
            ? 'text-green-900 dark:text-green-100'
            : 'text-yellow-900 dark:text-yellow-100'
          }`}
          >
            {card.explanation}
          </p>
        </Card>
      )}
    </div>
  )
}

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = newArr[i]!
    newArr[i] = newArr[j]!
    newArr[j] = temp
  }
  return newArr
}
