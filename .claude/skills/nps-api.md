Fetch data from the National Park Service API and expose it via tRPC.

## NPS API overview

- **Base URL**: `https://developer.nps.gov/api/v1`
- **Auth**: `?api_key=YOUR_KEY` query parameter on every request
- **Response shape**: `{ total: string, data: T[], limit: string, start: string }`

### Key endpoints

| Endpoint | Description |
|---|---|
| `/parks` | Core park info — name, description, addresses, hours, contacts |
| `/alerts` | Active park alerts |
| `/campgrounds` | Campground details and availability info |
| `/events` | Scheduled park events |
| `/visitorcenters` | Visitor center hours and locations |
| `/thingstodo` | Activity and recommendation listings |
| `/newsreleases` | Park news |
| `/webcams` | Live and virtual webcams |
| `/tours` | Guided tour info |
| `/articles` | Editorial articles |
| `/people` | Historical figures articles |
| `/places` | Geographic location articles |
| `/topics` + `/topics/parks` | Topic taxonomy + parks by topic |
| `/activities` + `/activities/parks` | Activity taxonomy + parks by activity |
| `/feespasses` | Entrance fees and passes |
| `/lessonplans` | Educational lesson plans |
| `/multimedia/audio` | Audio content |
| `/multimedia/galleries` | Photo galleries |
| `/multimedia/videos` | Video content |
| `/parkinglots` | Parking lot info |
| `/passportstamplocations` | Passport stamp station locations |
| `/roadevents` | Traffic incidents and work zones |
| `/amenities/parksplaces` | Amenities per park place |
| `/amenities/parksvisitorcenters` | Amenities per visitor center |

### Common query parameters

| Parameter | Description |
|---|---|
| `parkCode` | 4-char park code (e.g. `yose`, `grca`) — comma-separate for multiple |
| `stateCode` | 2-char state code (e.g. `CA`, `AZ`) |
| `q` | Full-text search |
| `limit` | Results per page (default 50) |
| `start` | Pagination offset (default 0) |
| `sort` | Field to sort by (e.g. `fullName`, `-releaseDate`) |

---

## How to add an NPS tRPC procedure

1. **Store the API key** — add `NPS_API_KEY` to the Cloudflare Worker secrets (via `wrangler secret put NPS_API_KEY`) and to `.dev.vars` locally. Access it in the Hono context via `c.env.NPS_API_KEY`.

2. **Create a helper** in `packages/api/src/nps.ts`:

```ts
const NPS_BASE = 'https://developer.nps.gov/api/v1'

export async function npsGet<T>(
  path: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<{ total: number; data: T[] }> {
  const url = new URL(`${NPS_BASE}${path}`)
  url.searchParams.set('api_key', apiKey)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`NPS API error: ${res.status}`)
  const json = await res.json() as { total: string; data: T[]; limit: string; start: string }
  return { total: Number(json.total), data: json.data }
}
```

3. **Add a tRPC procedure** — example in `packages/api/src/router/parks.ts`:

```ts
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { npsGet } from '../nps'

export const parksRouter = router({
  list: publicProcedure
    .input(z.object({
      stateCode: z.string().optional(),
      q: z.string().optional(),
      limit: z.number().default(20),
      start: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      return npsGet(
        '/parks',
        {
          ...(input.stateCode ? { stateCode: input.stateCode } : {}),
          ...(input.q ? { q: input.q } : {}),
          limit: String(input.limit),
          start: String(input.start),
        },
        ctx.env.NPS_API_KEY,
      )
    }),
})
```

4. **Merge** into `packages/api/src/router/index.ts`:

```ts
import { parksRouter } from './parks'
export const appRouter = router({ parks: parksRouter, /* ... */ })
```

5. **Pass `apiKey` via tRPC context** — the context is constructed in `packages/server/src/index.ts` from the Hono request context (`c.env.NPS_API_KEY`).

---

## Caching

All NPS responses must be cached. Use Cloudflare KV (bind a namespace called `NPS_CACHE` in `wrangler.toml`).

### TTL by endpoint

| TTL | Endpoints |
|---|---|
| **1 day** | `/parks`, `/visitorcenters`, `/topics`, `/activities`, `/people`, `/places`, `/lessonplans`, `/feespasses`, `/passportstamplocations`, `/amenities/*` |
| **5 min** | Everything else (alerts, events, campgrounds, newsreleases, roadevents, webcams, parkinglots, thingstodo, tours, articles, multimedia/*) |

### Stale-on-error (serve outdated cache if API is down)

If the NPS API returns an error or times out, serve the cached value regardless of age. Only throw if there is no cached value at all.

### Updated `npsGet` helper with caching

Replace the helper in `packages/api/src/nps.ts`:

```ts
const NPS_BASE = 'https://developer.nps.gov/api/v1'

// Endpoints whose data rarely changes — cache for 1 day
const LONG_CACHE_PATHS = new Set([
  '/parks', '/visitorcenters', '/topics', '/topics/parks',
  '/activities', '/activities/parks', '/people', '/places',
  '/lessonplans', '/feespasses', '/passportstamplocations',
  '/amenities/parksplaces', '/amenities/parksvisitorcenters',
])

const TTL_SHORT = 60 * 5        // 5 minutes
const TTL_LONG  = 60 * 60 * 24  // 1 day

export async function npsGet<T>(
  path: string,
  params: Record<string, string>,
  apiKey: string,
  kv: KVNamespace,
): Promise<{ total: number; data: T[] }> {
  const url = new URL(`${NPS_BASE}${path}`)
  url.searchParams.set('api_key', apiKey)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  // Omit api_key from the cache key
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
      // Cache in background — don't await
      kv.put(cacheKey, JSON.stringify(result), { expirationTtl: ttl })
      return result
    }
    fetchError = new Error(`NPS API error: ${res.status}`)
  } catch (err) {
    fetchError = err
  }

  // API failed — fall back to cache (even if stale)
  const cached = await kv.get(cacheKey)
  if (cached) return JSON.parse(cached) as { total: number; data: T[] }

  throw fetchError
}
```

### Wrangler binding

Add to `packages/server/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "NPS_CACHE"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_KV_PREVIEW_ID"
```

Pass `ctx.env.NPS_CACHE` as the `kv` argument when calling `npsGet`.

---

## Do not

- Do not call the NPS API directly from the client (exposes the API key)
- Do not use tRPC subscriptions for polling — use a standard query with a `refetchInterval` in `useQuery`
