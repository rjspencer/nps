import { initTRPC } from '@trpc/server'
import { z } from 'zod'

export interface NpsCacheKV {
  get(key: string): Promise<string | null>
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}

export type Context = {
  env: {
    NPS_CACHE: NpsCacheKV
    NPS_API_KEY: string
  }
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware
export { z }
