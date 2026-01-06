import type { Persister } from '@tanstack/react-query-persist-client'
import { isServer, QueryClient } from '@tanstack/react-query'
import { createDexiePersister } from '@/lib/query-persister'

function isAuthError(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status === 401 || error.status === 403
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status
    return status === 401 || status === 403
  }

  if (error instanceof Error) {
    return error.message.toLowerCase().includes('unauthorized')
  }

  return false
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 24 hours
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        // Consider data stale after 5 minutes
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Retry failed queries
        retry: (failureCount, error) => {
          if (isAuthError(error)) {
            return false
          }
          return failureCount < 2
        },
        // Refetch on window focus (only when online)
        refetchOnWindowFocus: 'always',
        // Refetch on reconnect
        refetchOnReconnect: 'always',
      },
      mutations: {
        // Retry failed mutations
        retry: (failureCount, error) => {
          if (isAuthError(error)) {
            return false
          }
          return failureCount < 2
        },
      },
    },
  })
}

// Browser singleton - prevents creating new QueryClient on each render
// This is critical to avoid "Invalid hook call" errors with SSR
let browserQueryClient: QueryClient | undefined
let browserPersister: Persister | undefined

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  }
  else {
    // Browser: reuse the same query client
    // This prevents re-creating the client if React suspends during initial render
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

function getPersister(): Persister | undefined {
  if (isServer) {
    return undefined
  }
  // Browser: reuse the same persister
  if (!browserPersister) {
    browserPersister = createDexiePersister()
  }
  return browserPersister
}

export function getContext() {
  const queryClient = getQueryClient()
  const persister = getPersister()

  return {
    queryClient,
    persister,
  }
}
