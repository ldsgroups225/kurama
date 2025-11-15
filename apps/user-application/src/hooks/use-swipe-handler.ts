import type { MotionValue, PanInfo } from 'motion/react'

const SWIPE_THRESHOLD = 80
const VELOCITY_THRESHOLD = 500
const VELOCITY_DISTANCE_THRESHOLD = 50
const DRAG_END_DELAY = 100

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
      onCorrect()
      return
    }

    // Swipe left - mark as incorrect
    if (
      offset.x < -SWIPE_THRESHOLD
      || (offset.x < -VELOCITY_DISTANCE_THRESHOLD && absVelocity > VELOCITY_THRESHOLD)
    ) {
      onIncorrect()
      return
    }

    // Return to center
    x.set(0)
  }

  return {
    handleDragStart,
    handleDragEnd,
  }
}
