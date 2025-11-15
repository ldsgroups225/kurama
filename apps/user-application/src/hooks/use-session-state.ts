import { useState } from 'react'

export type CardOrientation = 'term' | 'definition'

export interface SessionStats {
  correct: number
  incorrect: number
  skipped: number
}

/**
 * Hook to manage session state (cards, stats, settings)
 */
export function useSessionState() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  })
  const [startTime] = useState(() => Date.now())
  const [showSettings, setShowSettings] = useState(false)
  const [cardOrientation, setCardOrientation] = useState<CardOrientation>('term')
  const [isDragging, setIsDragging] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [cardHistory, setCardHistory] = useState<number[]>([])

  const incrementStat = (stat: keyof SessionStats) => {
    setSessionStats(prev => ({
      ...prev,
      [stat]: prev[stat] + 1,
    }))
  }

  const resetSession = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setSessionStats({ correct: 0, incorrect: 0, skipped: 0 })
    setCardHistory([])
  }

  const addToHistory = (index: number) => {
    setCardHistory(prev => [...prev, index])
  }

  const popFromHistory = () => {
    const previousIndex = cardHistory[cardHistory.length - 1]
    if (previousIndex !== undefined) {
      setCardHistory(prev => prev.slice(0, -1))
      return previousIndex
    }
    return null
  }

  return {
    currentCardIndex,
    setCurrentCardIndex,
    isFlipped,
    setIsFlipped,
    sessionStats,
    incrementStat,
    startTime,
    showSettings,
    setShowSettings,
    cardOrientation,
    setCardOrientation,
    isDragging,
    setIsDragging,
    isAutoPlaying,
    setIsAutoPlaying,
    cardHistory,
    addToHistory,
    popFromHistory,
    resetSession,
  }
}
