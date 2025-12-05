import { useMotionValue, useTransform } from 'motion/react'

const SWIPE_THRESHOLD = 80

/**
 * Hook to manage card swipe animations and visual feedback
 */
export function useCardSwipeAnimations() {
  const x = useMotionValue(0)

  // Card rotation and opacity based on swipe
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Background color transitions - use opaque background for backface-visibility to work
  // Using transparent white/dark for neutral state (works in both light/dark themes)
  const cardBackgroundColor = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    ['rgba(251, 146, 60, 0.15)', 'rgba(255, 255, 255, 0)', 'rgba(34, 197, 94, 0.15)'],
  )

  // Border color transitions
  const cardBorderColor = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    ['rgba(251, 146, 60, 0.5)', 'rgba(0, 0, 0, 0.1)', 'rgba(34, 197, 94, 0.5)'],
  )

  // Correct badge animations
  const correctBadgeBg = useTransform(
    x,
    [0, SWIPE_THRESHOLD],
    ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 1)'],
  )
  const correctBadgeScale = useTransform(x, [0, SWIPE_THRESHOLD], [1, 1.15])
  const showCorrectPreview = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const hideCorrectCount = useTransform(x, [0, SWIPE_THRESHOLD], [1, 0])

  // Incorrect badge animations
  const incorrectBadgeBg = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0],
    ['rgba(251, 146, 60, 1)', 'rgba(251, 146, 60, 0.1)'],
  )
  const incorrectBadgeScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1.15, 1])
  const showIncorrectPreview = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])
  const hideIncorrectCount = useTransform(x, [-SWIPE_THRESHOLD, 0], [0, 1])

  return {
    x,
    rotate,
    opacity,
    cardBackgroundColor,
    cardBorderColor,
    correctBadge: {
      backgroundColor: correctBadgeBg,
      scale: correctBadgeScale,
      showPreview: showCorrectPreview,
      hideCount: hideCorrectCount,
    },
    incorrectBadge: {
      backgroundColor: incorrectBadgeBg,
      scale: incorrectBadgeScale,
      showPreview: showIncorrectPreview,
      hideCount: hideIncorrectCount,
    },
  }
}
