import type { ComponentType } from 'react'
import { lazy } from 'react'
import { retryChunkLoad } from './chunk-retry'

/**
 * Helper function to create a lazy loaded component with retry logic
 * Use this for creating lazy components with automatic retry on failure
 */
export function createLazyComponent<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
) {
  return lazy(() => retryChunkLoad(loader))
}
