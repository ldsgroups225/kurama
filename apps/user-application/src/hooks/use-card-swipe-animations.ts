import { useMotionValue, useTransform } from 'motion/react'

const SWIPE_THRESHOLD = 80

/**
 * Semantic color tokens for swipe animations
 * These match the CSS variables in styles.css:
 * - warning-from: oklch(0.7 0.19 45) ≈ rgb(234, 88, 12) - Orange
 * - success-from: oklch(0.65 0.17 145) ≈ rgb(34, 197, 94) - Green
 * - secondary: oklch(0.274 0.006 286.033) ≈ rgb(39, 39, 42) - Zinc
 */
const COLORS = {
  // Warning/incorrect swipe - matches --warning-from
  warningOpaque: 'rgba(234, 88, 12, 1)',
  warningSemiOpaque: 'rgba(234, 88, 12, 0.8)',
  warningSemiTransparent: 'rgba(234, 88, 12, 0.5)',
  warningLight: 'rgba(251, 146, 60, 1)',
  warningLightTransparent: 'rgba(251, 146, 60, 0.1)',
  // Success/correct swipe - matches --success-from
  successOpaque: 'rgba(34, 197, 94, 1)',
  successSemiOpaque: 'rgba(34, 197, 94, 0.8)',
  successSemiTransparent: 'rgba(34, 197, 94, 0.5)',
  successTransparent: 'rgba(34, 197, 94, 0.1)',
  // Neutral - Transparent to let CSS bg-card/bg-background show through
  neutralCard: 'rgba(0, 0, 0, 0)',
  // Neutral Border - Generic grey that works on both light/dark or transparent to let border-border show (requires component change)
  // Using a subtle grey that works decently for both if we must hardcode, but ideally we want transparent if we can fallback to CSS.
  // However, since we can't easily fallback to CSS border when using style prop, we'll use a balanced grey.
  neutralBorder: 'rgba(127, 127, 127, 0.2)',
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
