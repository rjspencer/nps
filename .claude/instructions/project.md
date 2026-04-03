# Project Overview

Full-stack TypeScript monorepo ("Acme") using pnpm workspaces + Turborepo.

## Workspace layout

```
apps/
  web/      → TanStack Start (Cloudflare Workers SSR, Tailwind CSS v4)
  mobile/   → Expo SDK 55 + Expo Router + NativeWind v5
packages/
  api/      → @acme/api — tRPC v11 router (shared by web + server)
  db/       → @acme/db  — Drizzle ORM + PostgreSQL
  auth/     → @acme/auth — better-auth
  server/   → @acme/server — Hono on Cloudflare Workers
  ui/
    web/    → @acme/ui-web — shadcn/ui components
    native/ → @acme/ui-native — Gluestack UI v2 / NativeWind components
```

## Key constraints

- No Next.js — use TanStack Start for web
- No Hono RPC — use tRPC (works with both TanStack Start and Expo via @trpc/react-query)
- No tRPC subscriptions — broken with @hono/trpc-server; use polling or Cloudflare Durable Objects for real-time
- Shared tRPC hooks work identically on web and mobile — keep data-fetching logic in `packages/api`

## Deployment targets

- Web app → Cloudflare Workers (via TanStack Start's Cloudflare adapter)
- API server → Cloudflare Workers (Hono)
- Mobile → Expo (iOS + Android)
- Database → PostgreSQL (Drizzle migrations via `pnpm --filter @acme/db db:push`)
