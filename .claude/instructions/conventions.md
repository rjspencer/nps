# Conventions

## Package management

- Use `pnpm` for all installs; never use `npm install` or `yarn`
- Add workspace dependencies with `pnpm --filter <package> add <dep>`
- Internal packages use `workspace:*` protocol in package.json

## TypeScript

- Strict mode enabled across all packages (`tsconfig.base.json`)
- Prefer explicit return types on exported functions
- Use `satisfies` over `as` for type assertions where possible

## tRPC

- All procedures live in `packages/api/src/router/`
- Create a sub-router per domain (e.g. `user.ts`, `post.ts`), then merge in `packages/api/src/router/index.ts`
- Use `protectedProcedure` for auth-gated routes; `publicProcedure` for open routes
- Do not use tRPC subscriptions — use polling or Durable Objects instead

## Database (Drizzle)

- Schema files in `packages/db/src/schema/`
- One file per domain table (e.g. `users.ts`, `posts.ts`)
- Export all tables from `packages/db/src/schema/index.ts`
- Run migrations with `pnpm --filter @acme/db db:push` (dev) or `db:migrate` (prod)

## Styling

- Web: Tailwind CSS v4 utility classes — no inline styles
- Mobile: NativeWind v5 — use the same Tailwind class vocabulary as web
- Shared UI primitives in `packages/ui/` — avoid duplicating components across apps

## File naming

- React components: PascalCase (`UserCard.tsx`)
- Utilities / hooks: camelCase (`useAuth.ts`, `formatDate.ts`)
- Route files follow TanStack Start / Expo Router conventions (filesystem-based)
