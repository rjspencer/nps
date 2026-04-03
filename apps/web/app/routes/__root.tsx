/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import appCss from '~/styles/app.css?url'
import { TRPCProvider, makeTRPCClient, makeQueryClient } from '~/trpc'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'NPS Parks' },
      { name: 'description', content: 'Browse National Parks' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => makeQueryClient())
  const [trpcClient] = React.useState(() => makeTRPCClient())

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <header className="border-b px-4 py-3">
              <nav className="flex gap-4">
                <Link
                  to="/"
                  activeProps={{ className: 'font-bold' }}
                  activeOptions={{ exact: true }}
                >
                  Home
                </Link>
              </nav>
            </header>
            <main className="container mx-auto p-4">{children}</main>
            <TanStackRouterDevtools position="bottom-right" />
          </QueryClientProvider>
        </TRPCProvider>
        <Scripts />
      </body>
    </html>
  )
}
