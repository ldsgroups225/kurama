import type { Persister } from '@tanstack/react-query-persist-client'
import { QueryClient } from '@tanstack/react-query'
import { createDexiePersister } from '@/lib/query-persister'

export function getContext() {
  // Create QueryClient with appropriate settings for persistence
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 24 hours
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        // Consider data stale after 5 minutes
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Retry failed queries
        retry: 2,
        // Refetch on window focus (only when online)
        refetchOnWindowFocus: 'always',
        // Refetch on reconnect
        refetchOnReconnect: 'always',
      },
      mutations: {
        // Retry failed mutations
        retry: 2,
      },
    },
  })

  // Create persister only on client-side (not during SSR)
  let persister: Persister | undefined
  if (typeof window !== 'undefined') {
    persister = createDexiePersister()
  }

  return {
    queryClient,
    persister,
  }
}
