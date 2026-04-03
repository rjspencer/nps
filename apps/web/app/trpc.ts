import { createTRPCContext } from '@trpc/tanstack-react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '@acme/api'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

export function makeTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: (import.meta as { env?: { VITE_TRPC_URL?: string } }).env?.VITE_TRPC_URL ?? 'http://localhost:8787/trpc',
      }),
    ],
  })
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes — matches server cache floor
      },
    },
  })
}
