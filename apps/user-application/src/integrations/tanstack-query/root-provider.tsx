import type { QueryClient } from '@tanstack/react-query'
import type { Persister } from '@tanstack/react-query-persist-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useEffect } from 'react'
import { setupStorageMonitoring } from '@/lib/cache-eviction'
import { setupServiceWorkerSyncHandler } from '@/lib/sw-sync-handler'

export function Provider({
  children,
  queryClient,
  persister,
}: {
  children: React.ReactNode
  queryClient: QueryClient
  persister?: Persister
}) {
  // Setup service worker sync handler and storage monitoring on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setupServiceWorkerSyncHandler()

      // Setup automatic cache eviction monitoring
      // Check every 5 minutes
      const cleanup = setupStorageMonitoring(5 * 60 * 1000)

      return cleanup
    }
  }, [])

  // Use PersistQueryClientProvider if persister is provided (client-side)
  // Otherwise use regular QueryClientProvider (SSR)
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        {children}
      </PersistQueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
