import { useCallback, useSyncExternalStore } from 'react'

/**
 * Hook to track viewport height reactively
 */
export function useViewportHeight() {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof window === 'undefined') {
      return () => { }
    }

    window.addEventListener('resize', onChange)
    return () => window.removeEventListener('resize', onChange)
  }, [])

  const getSnapshot = useCallback(() => {
    return typeof window === 'undefined' ? 0 : window.innerHeight
  }, [])

  const getServerSnapshot = () => 0

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
