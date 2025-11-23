import type { MatchingCardProps } from './types'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function MatchingView({ card, onAnswer }: MatchingCardProps) {
  const isFirstRender = useRef(true)
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [incorrectPairs, setIncorrectPairs] = useState<Set<string>>(() => new Set())
  const [isComplete, setIsComplete] = useState(false)

  // Parse pairs from card data
  const pairs = useMemo(() => card.pairs || [], [card.pairs])
  const leftItems = pairs.map(p => ({ id: p.id, text: p.left }))

  // Initialize right items with a shuffle on first render
  const [rightItems, setRightItems] = useState<{ id: string, text: string }[]>(() => {
    const items = pairs.map(p => ({ id: p.id, text: p.right }))
    return shuffleArray(items)
  })

  // Update right items when pairs change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const items = pairs.map(p => ({ id: p.id, text: p.right }))
    const timeoutId = setTimeout(() => {
      setRightItems(shuffleArray(items))
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [pairs])

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      // Correct match
      const newMatches = { ...matches, [leftId]: rightId }
      setMatches(newMatches)
      setSelectedLeft(null)
      setSelectedRight(null)

      // Check if all matched
      if (Object.keys(newMatches).length === pairs.length) {
        setIsComplete(true)
        setTimeout(() => onAnswer?.(true), 500)
      }
    }
    else {
      // Incorrect match
      setIncorrectPairs(new Set([leftId, rightId]))
      setTimeout(() => {
        setSelectedLeft(null)
        setSelectedRight(null)
        setIncorrectPairs(new Set())
      }, 800)
    }
  }

  const handleLeftClick = (id: string) => {
    if (matches[id])
      return // Already matched
    setSelectedLeft(id)
    setIncorrectPairs(new Set())

    if (selectedRight) {
      checkMatch(id, selectedRight)
    }
  }

  const handleRightClick = (id: string) => {
    if (Object.values(matches).includes(id))
      return // Already matched
    setSelectedRight(id)
    setIncorrectPairs(new Set())

    if (selectedLeft) {
      checkMatch(selectedLeft, id)
    }
  }

  const isMatched = (id: string, side: 'left' | 'right') => {
    if (side === 'left')
      return !!matches[id]
    return Object.values(matches).includes(id)
  }

  const isSelected = (id: string, side: 'left' | 'right') => {
    if (side === 'left')
      return selectedLeft === id
    return selectedRight === id
  }

  const isIncorrect = (id: string) => incorrectPairs.has(id)

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold">{card.frontContent}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Match the items by clicking pairs
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-3">
          {leftItems.map(item => (
            <Button
              key={item.id}
              variant={isMatched(item.id, 'left') ? 'default' : 'outline'}
              className={`w-full justify-start text-left ${isSelected(item.id, 'left') ? 'ring-2 ring-primary' : ''
              } ${isIncorrect(item.id) ? 'border-destructive bg-destructive/10' : ''}`}
              onClick={() => handleLeftClick(item.id)}
              disabled={isMatched(item.id, 'left') || isComplete}
            >
              <span className="flex-1">{item.text}</span>
              {isMatched(item.id, 'left') && (
                <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
              )}
              {isIncorrect(item.id) && (
                <XCircle className="ml-2 h-4 w-4 text-destructive" />
              )}
            </Button>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {rightItems.map(item => (
            <Button
              key={item.id}
              variant={isMatched(item.id, 'right') ? 'default' : 'outline'}
              className={`w-full justify-start text-left ${isSelected(item.id, 'right') ? 'ring-2 ring-primary' : ''
              } ${isIncorrect(item.id) ? 'border-destructive bg-destructive/10' : ''}`}
              onClick={() => handleRightClick(item.id)}
              disabled={isMatched(item.id, 'right') || isComplete}
            >
              <span className="flex-1">{item.text}</span>
              {isMatched(item.id, 'right') && (
                <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
              )}
              {isIncorrect(item.id) && (
                <XCircle className="ml-2 h-4 w-4 text-destructive" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {isComplete && card.explanation && (
        <Card className="mt-6 bg-green-50 p-4 dark:bg-green-950">
          <p className="text-sm text-green-900 dark:text-green-100">
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
