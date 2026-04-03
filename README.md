# Acme Monorepo

A full-stack TypeScript monorepo using pnpm workspaces and Turborepo.

## Stack

| Layer | Technology |
|-------|-----------|
| Web app | TanStack Start + Tailwind CSS v4 (Cloudflare Workers SSR) |
| Mobile app | Expo SDK 55 + Expo Router + NativeWind v4 |
| API | tRPC v11 (shared router) |
| Database | Drizzle ORM + PostgreSQL |
| Auth | better-auth |
| Server | Hono on Cloudflare Workers |
| UI (web) | shadcn/ui ready |
| UI (native) | Gluestack UI v2 / NativeWind ready |
| Build system | Turborepo v2 |

## Workspace layout

```
apps/
  web/      → TanStack Start app (deploys to Cloudflare Workers)
  mobile/   → Expo app
packages/
  api/      → @acme/api — tRPC router (consumed by web + server)
  db/       → @acme/db  — Drizzle ORM schema and client
  auth/     → @acme/auth — better-auth instance
  server/   → @acme/server — Hono worker (deploys to Cloudflare Workers)
  ui/
    web/    → @acme/ui-web — shadcn/ui components
    native/ → @acme/ui-native — Gluestack / NativeWind components
```

## Prerequisites

- Node.js >= 20
- pnpm >= 10 (`npm install -g pnpm`)
- A PostgreSQL database (local or hosted)
- Cloudflare account + Wrangler (`pnpm add -g wrangler`)

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env
# Edit .env files with your DATABASE_URL, BETTER_AUTH_SECRET, etc.

# 3. Push the database schema
pnpm --filter @acme/db db:push

# 4. Run everything in dev mode
pnpm dev

# Or run individual apps/packages:
pnpm --filter @acme/web dev       # Web app at http://localhost:3000
pnpm --filter @acme/mobile dev    # Expo app
pnpm --filter @acme/server dev    # Hono Worker (wrangler dev)
```

## Building

```bash
pnpm build
```

## Deploying to Cloudflare Workers

```bash
# Deploy the Hono API server
pnpm --filter @acme/server deploy

# Deploy the web app
pnpm --filter @acme/web deploy
```

## Adding shadcn/ui components

```bash
cd packages/ui/web
npx shadcn@latest init
npx shadcn@latest add button card input
```

## Environment variables

| Variable | Package | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `@acme/db` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | `@acme/auth` | Random secret for session signing |
| `BETTER_AUTH_URL` | `@acme/auth` | Base URL of your app |

## Type checking & linting

```bash
pnpm type-check
pnpm lint
```
