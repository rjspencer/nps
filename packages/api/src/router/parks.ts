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

export interface NpsEvent {
  id: string
  title: string
  description: string
  dateStart: string
  dateEnd: string
  timeStart: string
  timeEnd: string
  location: string
  feeInfo: string
  regResURL: string
}

export interface ThingToDo {
  id: string
  title: string
  shortDescription: string
  url: string
  season: string[]
  activities: { id: string; name: string }[]
}

export interface VisitorCenter {
  id: string
  name: string
  description: string
  directionsInfo: string
  operatingHours: { name: string; description: string; exceptions: { name: string; startDate: string; endDate: string }[] }[]
}

export interface PassportStampLocation {
  id: string
  label: string
  type: string
}

export interface LessonPlan {
  id: string
  title: string
  gradeLevel: string
  subject: string
  duration: string
  url: string
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

  detail: publicProcedure
    .input(z.object({ parkCode: z.string() }))
    .query(async ({ input, ctx }) => {
      const { parkCode } = input
      const pc = parkCode

      const [parkRes, eventsRes, thingsToDoRes, visitorCentersRes, passportRes, lessonPlansRes] =
        await Promise.all([
          npsGet<Park>('/parks', { parkCode: pc, limit: '1' }, ctx.env.NPS_API_KEY, ctx.env.NPS_CACHE),
          npsGet<NpsEvent>('/events', { parkCode: pc, limit: '10' }, ctx.env.NPS_API_KEY, ctx.env.NPS_CACHE),
          npsGet<ThingToDo>('/thingstodo', { parkCode: pc, limit: '10' }, ctx.env.NPS_API_KEY, ctx.env.NPS_CACHE),
          npsGet<VisitorCenter>('/visitorcenters', { parkCode: pc }, ctx.env.NPS_API_KEY, ctx.env.NPS_CACHE),
          npsGet<PassportStampLocation>('/passportstamplocations', { parkCode: pc }, ctx.env.NPS_API_KEY, ctx.env.NPS_CACHE),
          npsGet<LessonPlan>('/lessonplans', { parkCode: pc, limit: '10' }, ctx.env.NPS_API_KEY, ctx.env.NPS_CACHE),
        ])

      return {
        park: parkRes.data[0] ?? null,
        events: eventsRes.data,
        thingsToDo: thingsToDoRes.data,
        visitorCenters: visitorCentersRes.data,
        passportStampLocations: passportRes.data,
        lessonPlans: lessonPlansRes.data,
      }
    }),
})
