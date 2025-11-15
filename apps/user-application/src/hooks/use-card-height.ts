import { useMemo } from 'react'

const RESERVED_SPACE = 285 // Header + progress + badges + buttons + padding
const MIN_HEIGHT = 300
const MAX_HEIGHT = 600

/**
 * Calculate optimal card height based on viewport
 */
export function useCardHeight(viewportHeight: number) {
  return useMemo(() => {
    if (viewportHeight === 0) {
      return 500
    }

    const availableHeight = viewportHeight - RESERVED_SPACE
    return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, availableHeight))
  }, [viewportHeight])
}
