Add a new tRPC procedure to the API.

Steps:
1. Identify the domain. If a router file for it exists at `packages/api/src/router/<domain>.ts`, add to it. Otherwise create a new file.
2. Choose `publicProcedure` or `protectedProcedure` based on auth requirements.
3. Define input with `z.object({...})` and implement the handler.
4. If creating a new router file, export it and merge it into `packages/api/src/router/index.ts`.
5. The procedure is automatically available to both `apps/web` and `apps/mobile` via the shared `@acme/api` package — no extra wiring needed.

Never use tRPC subscriptions — they are broken with @hono/trpc-server.
