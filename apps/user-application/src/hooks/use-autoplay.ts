import type { MotionValue } from 'motion/react'
import { useEffect } from 'react'

const FLIP_DELAY = 4000
const NEXT_CARD_DELAY = 4000
const SWIPE_ANIMATION_DURATION = 600
const SWIPE_TARGET_X = 250

interface UseAutoplayOptions {
  isAutoPlaying: boolean
  isFlipped: boolean
  cardsLength: number
  x: MotionValue<number>
  onFlip: () => void
  onMarkCorrect: () => void
  onNextCard: () => void
}

/**
 * Hook to manage autoplay functionality
 */
export function useAutoplay({
  isAutoPlaying,
  isFlipped,
  cardsLength,
  x,
  onFlip,
  onMarkCorrect,
  onNextCard,
}: UseAutoplayOptions) {
  useEffect(() => {
    if (!isAutoPlaying || cardsLength === 0) {
      return
    }

    let nextTimer: ReturnType<typeof setTimeout> | undefined

    const flipTimer = setTimeout(() => {
      onFlip()

      nextTimer = setTimeout(() => {
        animateSwipeRight()
      }, NEXT_CARD_DELAY)
    }, isFlipped ? 0 : FLIP_DELAY)

    function animateSwipeRight() {
      let currentX = 0
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / SWIPE_ANIMATION_DURATION, 1)

        // Ease-out cubic for natural deceleration
        const easeProgress = 1 - (1 - progress) ** 3
        currentX = SWIPE_TARGET_X * easeProgress

        x.set(currentX)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
        else {
          onMarkCorrect()
          onNextCard()
        }
      }

      animate()
    }

    return () => {
      clearTimeout(flipTimer)
      if (nextTimer) {
        clearTimeout(nextTimer)
      }
    }
  }, [isAutoPlaying, isFlipped, cardsLength, x, onFlip, onMarkCorrect, onNextCard])
}
