import type { QueryClient } from '@tanstack/react-query'
import type { Persister } from '@tanstack/react-query-persist-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useEffect } from 'react'
import { setupStorageMonitoring } from '@/lib/cache-eviction'
import { cleanupDataSecurity, initializeDataSecurity } from '@/lib/data-security'
import { initializeProgressiveEnhancement } from '@/lib/feature-detection'
import { setupPWAErrorHandlers, startQuotaMonitoring } from '@/lib/pwa-monitoring'
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
  // Initialize progressive enhancement and setup handlers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize data security measures
      initializeDataSecurity()

      // Initialize progressive enhancement
      initializeProgressiveEnhancement().then((caps) => {
        // Setup PWA error handlers
        setupPWAErrorHandlers()

        // Start quota monitoring (check every 5 minutes)
        const stopQuotaMonitoring = startQuotaMonitoring(5 * 60 * 1000)

        // Setup service worker sync handler if supported
        if (caps.serviceWorker) {
          setupServiceWorkerSyncHandler()
        }

        // Setup automatic cache eviction monitoring
        // Check every 5 minutes
        const stopStorageMonitoring = setupStorageMonitoring(5 * 60 * 1000)

        return () => {
          stopQuotaMonitoring()
          stopStorageMonitoring()
          cleanupDataSecurity()
        }
      })
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
