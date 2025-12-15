import type { MotionValue, PanInfo } from 'motion/react'
import { ANIMATION_CONFIG } from '@kurama/config/animation'
import { animate } from 'motion/react'

const SWIPE_THRESHOLD = ANIMATION_CONFIG.swipe.threshold
const SWIPE_TARGET_X = ANIMATION_CONFIG.swipe.targetX
const VELOCITY_THRESHOLD = ANIMATION_CONFIG.swipe.velocityThreshold
const VELOCITY_DISTANCE_THRESHOLD = ANIMATION_CONFIG.swipe.velocityDistanceThreshold
const DRAG_END_DELAY = ANIMATION_CONFIG.swipe.dragEndDelay
// Fast swipe completion animation (150ms for snappy feel)
const SWIPE_COMPLETE_DURATION = 0.15

interface SwipeHandlerOptions {
  x: MotionValue<number>
  onCorrect: () => void
  onIncorrect: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

/**
 * Creates swipe gesture handlers for flashcards
 */
export function createSwipeHandlers({
  x,
  onCorrect,
  onIncorrect,
  onDragStart,
  onDragEnd,
}: SwipeHandlerOptions) {
  const handleDragStart = () => {
    onDragStart()
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Reset dragging state after delay to prevent flip on drag end
    setTimeout(onDragEnd, DRAG_END_DELAY)

    const { offset, velocity } = info
    const absVelocity = Math.abs(velocity.x)

    // Swipe right - mark as correct
    if (
      offset.x > SWIPE_THRESHOLD
      || (offset.x > VELOCITY_DISTANCE_THRESHOLD && absVelocity > VELOCITY_THRESHOLD)
    ) {
      // Animate card off-screen to the right, then trigger callback
      animate(x, SWIPE_TARGET_X, {
        duration: SWIPE_COMPLETE_DURATION,
        ease: 'easeOut',
        onComplete: onCorrect,
      })
      return
    }

    // Swipe left - mark as incorrect
    if (
      offset.x < -SWIPE_THRESHOLD
      || (offset.x < -VELOCITY_DISTANCE_THRESHOLD && absVelocity > VELOCITY_THRESHOLD)
    ) {
      // Animate card off-screen to the left, then trigger callback
      animate(x, -SWIPE_TARGET_X, {
        duration: SWIPE_COMPLETE_DURATION,
        ease: 'easeOut',
        onComplete: onIncorrect,
      })
      return
    }

    // Return to center with spring animation
    animate(x, 0, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    })
  }

  return {
    handleDragStart,
    handleDragEnd,
  }
}
