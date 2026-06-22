Add a new database table with Drizzle ORM.

Steps:
1. Create `packages/db/src/schema/<domain>.ts` and define the table with `pgTable`.
2. Export it from `packages/db/src/schema/index.ts`.
3. Add corresponding TypeScript types (inferred via `typeof table.$inferSelect` / `$inferInsert`).
4. Push to the database:
   - Dev: `pnpm --filter @acme/db db:push`
   - Prod: `pnpm --filter @acme/db db:migrate`
5. If you need relations, define them in the same file using Drizzle's `relations()` helper and re-export.
