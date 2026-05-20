'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'
import { WeatherError } from '@/lib/weatherApi'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            // Don't retry 4xx errors — a city-not-found 400/404 won't self-heal.
            retry: (failureCount, error: unknown) => {
              if (error instanceof WeatherError && error.status < 500) return false
              return failureCount < 2
            },
            refetchOnWindowFocus: false,
            // Keep queries alive even without a network connection so the UI
            // can still display cached data offline.
            networkMode: 'always',
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  )
}
