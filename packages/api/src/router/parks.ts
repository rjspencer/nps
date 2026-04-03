import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { npsGet } from '../nps'

export interface Park {
  id: string
  fullName: string
  parkCode: string
  description: string
  designation: string
  states: string
  url: string
  images: { url: string; title: string; altText: string }[]
}

// Max parks the NPS API will return in one request
const NPS_MAX_LIMIT = 500

export const parksRouter = router({
  list: publicProcedure
    .input(
      z.object({
        q: z.string().optional(),
        stateCode: z.string().optional(),
        designation: z.string().optional(),
        sort: z.enum(['fullName', '-fullName', 'relevanceScore']).default('fullName'),
        limit: z.number().int().min(1).max(50).default(20),
        start: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ input, ctx }) => {
      const params: Record<string, string> = { sort: input.sort }
      if (input.stateCode) params.stateCode = input.stateCode

      // Name search and designation have no NPS API equivalent — fetch all and filter server-side
      if (input.q || input.designation) {
        const all = await npsGet<Park>(
          '/parks',
          { ...params, limit: String(NPS_MAX_LIMIT), start: '0' },
          ctx.env.NPS_API_KEY,
          ctx.env.NPS_CACHE,
        )
        const needle = input.q?.toLowerCase()
        const filtered = all.data.filter((p) => {
          if (needle && !p.fullName.toLowerCase().includes(needle)) return false
          if (input.designation && p.designation !== input.designation) return false
          return true
        })
        return {
          total: filtered.length,
          data: filtered.slice(input.start, input.start + input.limit),
        }
      }

      return npsGet<Park>(
        '/parks',
        { ...params, limit: String(input.limit), start: String(input.start) },
        ctx.env.NPS_API_KEY,
        ctx.env.NPS_CACHE,
      )
    }),

  designations: publicProcedure.query(async ({ ctx }) => {
    const all = await npsGet<Park>(
      '/parks',
      { limit: String(NPS_MAX_LIMIT), start: '0', sort: 'fullName' },
      ctx.env.NPS_API_KEY,
      ctx.env.NPS_CACHE,
    )
    const unique = [...new Set(all.data.map((p) => p.designation).filter(Boolean))].sort()
    return unique
  }),
})
