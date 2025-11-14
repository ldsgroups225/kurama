import { lazy, Suspense, ComponentType } from 'react'
import { LazyErrorBoundary } from '@/components/lazy-error-boundary'
import { retryChunkLoad } from './chunk-retry'

interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  onError?: (error: Error) => void
  [key: string]: any
}

/**
 * Reusable lazy loading wrapper with error handling and retry logic
 * Combines Suspense, error boundaries, and chunk retry functionality
 */
export function LazyComponent({
  loader,
  fallback = <div className="animate-pulse p-6">Loading...</div>,
  errorFallback,
  onError,
  ...props
}: LazyComponentProps) {
  const Component = lazy(() => retryChunkLoad(loader))

  return (
    <LazyErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    </LazyErrorBoundary>
  )
}

/**
 * Helper function to create a lazy loaded component with retry logic
 * Use this for creating lazy components with automatic retry on failure
 */
export function createLazyComponent<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>
) {
  return lazy(() => retryChunkLoad(loader))
}
