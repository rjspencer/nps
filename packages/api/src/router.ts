import { z } from 'zod'
import { publicProcedure, router } from './trpc'
import { parksRouter } from './router/parks'

export const appRouter = router({
  parks: parksRouter,

  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello, ${input.name ?? 'world'}!`,
      }
    }),

  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),
})

export type AppRouter = typeof appRouter
