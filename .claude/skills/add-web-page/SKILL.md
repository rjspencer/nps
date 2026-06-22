Add a new page to the TanStack Start web app.

Steps:
1. Create a route file at `apps/web/src/routes/<path>.tsx` following TanStack Start's file-based routing conventions.
2. Export a `Route` created with `createFileRoute('<path>')`.
3. Use `Route.useLoaderData()` for server data; fetch via tRPC using `@trpc/react-query` for client data.
4. Style with Tailwind CSS v4 utility classes — no inline styles.
5. For shared UI, import from `@acme/ui-web`; for page-specific components, co-locate in `apps/web/src/components/`.
