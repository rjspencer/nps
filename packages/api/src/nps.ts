import type { NpsCacheKV } from './trpc'

const NPS_BASE = 'https://developer.nps.gov/api/v1'

// Endpoints whose data rarely changes — cache for 1 day
const LONG_CACHE_PATHS = new Set([
  '/parks',
  '/visitorcenters',
  '/topics',
  '/topics/parks',
  '/activities',
  '/activities/parks',
  '/people',
  '/places',
  '/lessonplans',
  '/feespasses',
  '/passportstamplocations',
  '/amenities/parksplaces',
  '/amenities/parksvisitorcenters',
])

const TTL_SHORT = 60 * 5        // 5 minutes
const TTL_LONG  = 60 * 60 * 24  // 1 day

export async function npsGet<T>(
  path: string,
  params: Record<string, string>,
  apiKey: string,
  kv: NpsCacheKV,
): Promise<{ total: number; data: T[] }> {
  const url = new URL(`${NPS_BASE}${path}`)
  url.searchParams.set('api_key', apiKey)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v)
  }

  // Build cache key without the API key
  const cacheUrl = new URL(url.toString())
  cacheUrl.searchParams.delete('api_key')
  const cacheKey = cacheUrl.toString()

  const ttl = LONG_CACHE_PATHS.has(path) ? TTL_LONG : TTL_SHORT

  // Attempt live fetch
  let fetchError: unknown
  try {
    const res = await fetch(url.toString())
    if (res.ok) {
      const json = await res.json() as { total: string; data: T[]; limit: string; start: string }
      const result = { total: Number(json.total), data: json.data }
      // Cache in background — don't block the response
      kv.put(cacheKey, JSON.stringify(result), { expirationTtl: ttl })
      return result
    }
    fetchError = new Error(`NPS API error: ${res.status}`)
  } catch (err) {
    fetchError = err
  }

  // API failed — fall back to cache regardless of age
  const cached = await kv.get(cacheKey)
  if (cached) return JSON.parse(cached) as { total: number; data: T[] }

  throw fetchError
}
