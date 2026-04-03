import { createTRPCContext } from '@trpc/tanstack-react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '@acme/api'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

const TRPC_URL = __DEV__
  ? 'http://localhost:8787/trpc'
  : 'https://acme-server.YOUR_SUBDOMAIN.workers.dev/trpc'

export function makeTRPCClient() {
  return createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: TRPC_URL })],
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
