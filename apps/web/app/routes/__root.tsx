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

type Theme = 'light' | 'dark' | 'desert' | 'tropical' | 'forest' | 'maritime'

const THEMES: { name: Theme; label: string; icon: React.ReactNode }[] = [
  {
    name: 'light',
    label: 'Light',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
    ),
  },
  {
    name: 'dark',
    label: 'Dark',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      </svg>
    ),
  },
  {
    name: 'desert',
    label: 'Desert',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21V5"/>
        <path d="M12 13H8V8"/>
        <path d="M12 10h4V5"/>
      </svg>
    ),
  },
  {
    name: 'tropical',
    label: 'Tropical',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"/>
        <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"/>
        <path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35z"/>
        <path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"/>
      </svg>
    ),
  },
  {
    name: 'forest',
    label: 'Forest',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L4 14h4l-3 6h14l-3-6h4z"/>
        <line x1="12" y1="20" x2="12" y2="22"/>
      </svg>
    ),
  },
  {
    name: 'maritime',
    label: 'Maritime',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2"/>
        <line x1="12" y1="7" x2="12" y2="20"/>
        <path d="M6 15l6 5 6-5"/>
        <line x1="6" y1="11" x2="18" y2="11"/>
      </svg>
    ),
  },
]

function ThemeSwitcher() {
  const [theme, setTheme] = React.useState<Theme>('light')

  React.useEffect(() => {
    const html = document.documentElement
    const active = THEMES.find((t) => t.name !== 'light' && html.classList.contains(t.name))
    setTheme(active?.name ?? 'light')
  }, [])

  const applyTheme = (next: Theme) => {
    const html = document.documentElement
    THEMES.forEach((t) => html.classList.remove(t.name))
    if (next !== 'light') html.classList.add(next)
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  return (
    <div className="flex items-center gap-0.5">
      {THEMES.map((t) => (
        <button
          key={t.name}
          onClick={() => applyTheme(t.name)}
          aria-label={`${t.label} theme`}
          title={t.label}
          style={theme === t.name ? { background: 'var(--foreground)', color: 'var(--background)' } : {}}
          className="rounded p-1.5 hover:bg-muted transition-colors"
        >
          {t.icon}
        </button>
      ))}
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => makeQueryClient())
  const [trpcClient] = React.useState(() => makeTRPCClient())

  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Apply saved theme before paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t&&t!=='light')document.documentElement.classList.add(t)})()` }} />
      </head>
      <body>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <header style={{ borderBottom: '2px solid var(--foreground)' }} className="px-4 py-3">
              <nav className="flex items-center justify-between">
                <div className="flex gap-4">
                  <Link
                    to="/"
                    activeProps={{ className: 'font-bold' }}
                    activeOptions={{ exact: true }}
                    className="flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    Home
                  </Link>
                </div>
                <ThemeSwitcher />
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
