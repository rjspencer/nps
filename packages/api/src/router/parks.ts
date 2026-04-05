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
  images: { url: string; title: string; altText: string; caption: string; credit: string }[]
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
  subject: string[]
  duration: string
  url: string
  questionObjective: string
  commonCore: {
    stateStandards: string
    additionalStandards: string
    mathStandards: string[]
    elaStandards: string[]
  }
}

const PAGE_SIZE = 150

export const parksRouter = router({
  list: publicProcedure
    .input(z.object({
      start: z.number().int().min(0).default(0),
      limit: z.number().int().min(1).max(PAGE_SIZE).default(PAGE_SIZE),
    }))
    .query(async ({ input, ctx }) => {
      const res = await npsGet<Park>(
        '/parks',
        { limit: String(input.limit), start: String(input.start), sort: 'fullName' },
        ctx.env.NPS_API_KEY,
        ctx.env.NPS_CACHE,
      )
      return res.data
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

  lessonPlanDetail: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const res = await npsGet<LessonPlan>(
        '/lessonplans',
        { id: input.id, limit: '1' },
        ctx.env.NPS_API_KEY,
        ctx.env.NPS_CACHE,
      )
      return res.data[0] ?? null
    }),
})
