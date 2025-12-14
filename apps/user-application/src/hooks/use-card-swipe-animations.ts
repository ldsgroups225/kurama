import { useMotionValue, useTransform } from 'motion/react'

const SWIPE_THRESHOLD = 80

/**
 * Semantic color tokens for swipe animations using CSS variables
 * These use CSS custom properties to support light/dark themes automatically
 */
const COLORS = {
  // Warning/incorrect swipe - uses CSS variables with opacity
  warningOpaque: 'oklch(from var(--warning-from) l c h / 1)',
  warningSemiOpaque: 'oklch(from var(--warning-from) l c h / 0.8)',
  warningSemiTransparent: 'oklch(from var(--warning-from) l c h / 0.5)',
  warningLight: 'oklch(from var(--warning-to) l c h / 1)',
  warningLightTransparent: 'oklch(from var(--warning-to) l c h / 0.1)',
  // Success/correct swipe - uses CSS variables with opacity
  successOpaque: 'oklch(from var(--success-from) l c h / 1)',
  successSemiOpaque: 'oklch(from var(--success-from) l c h / 0.8)',
  successSemiTransparent: 'oklch(from var(--success-from) l c h / 0.5)',
  successTransparent: 'oklch(from var(--success-from) l c h / 0.1)',
  // Neutral - Transparent to let CSS bg-card/bg-background show through
  neutralCard: 'transparent',
  // Neutral Border - Uses CSS border variable with opacity
  neutralBorder: 'oklch(from var(--border) l c h / 0.2)',
} as const

/**
 * Hook to manage card swipe animations and visual feedback
 */
export function useCardSwipeAnimations() {
  const x = useMotionValue(0)

  // Card rotation and opacity based on swipe
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Background color transitions - Glassmorphism support
  // Base: zinc-900/60 -> Green/Orange tint on swipe
  const cardBackgroundColor = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    [COLORS.warningSemiTransparent, COLORS.neutralCard, COLORS.successSemiTransparent],
  )

  // Border color transitions
  const cardBorderColor = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    [COLORS.warningSemiOpaque, COLORS.neutralBorder, COLORS.successSemiOpaque],
  )

  // Correct badge animations
  const correctBadgeBg = useTransform(
    x,
    [0, SWIPE_THRESHOLD],
    [COLORS.successTransparent, COLORS.successOpaque],
  )
  const correctBadgeScale = useTransform(x, [0, SWIPE_THRESHOLD], [1, 1.15])
  const showCorrectPreview = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const hideCorrectCount = useTransform(x, [0, SWIPE_THRESHOLD], [1, 0])

  // Incorrect badge animations
  const incorrectBadgeBg = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0],
    [COLORS.warningLight, COLORS.warningLightTransparent],
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
