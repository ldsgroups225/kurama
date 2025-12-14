/**
 * Animation timing configuration
 * Centralized magic numbers for consistent UX
 */
export const ANIMATION_CONFIG = {
  // Autoplay timings (ms)
  autoplay: {
    flipDelay: 4000,
    nextCardDelay: 4000,
    swipeAnimationDuration: 600,
  },

  // Swipe thresholds (px)
  swipe: {
    threshold: 80,
    targetX: 250,
    velocityThreshold: 500,
    velocityDistanceThreshold: 50,
    dragEndDelay: 100,
  },

  // Card animations
  card: {
    rotationRange: [-15, 0, 15],
    opacityRange: [0.5, 1, 1, 1, 0.5],
  },

  // Transition durations (ms)
  transitions: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
} as const

export type AnimationConfig = typeof ANIMATION_CONFIG
