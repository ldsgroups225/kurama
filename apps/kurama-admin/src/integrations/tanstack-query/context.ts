import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        refetchOnWindowFocus: 'always',
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 2,
      },
    },
  })

  return {
    queryClient,
  }
}
