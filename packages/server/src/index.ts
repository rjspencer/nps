import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { trpcServer } from '@hono/trpc-server'
import { appRouter } from '@acme/api'

export interface Env {
  NPS_CACHE: KVNamespace
  NPS_API_KEY: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS middleware
app.use(
  '/trpc/*',
  cors({
    origin: ['http://localhost:3000', 'https://acme-web.235trv.workers.dev'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Mount tRPC router at /trpc
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => {
      return { env: c.env }
    },
  })
)

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
