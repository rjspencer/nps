import { createFileRoute, Link } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import * as React from 'react'
import { useTRPC } from '~/trpc'
import type { Park } from '@acme/api'

export const Route = createFileRoute('/')({
  component: Home,
})

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' }, { code: 'PR', name: 'Puerto Rico' },
  { code: 'VI', name: 'U.S. Virgin Islands' }, { code: 'GU', name: 'Guam' },
  { code: 'AS', name: 'American Samoa' }, { code: 'MP', name: 'Northern Mariana Islands' },
]

const LIMIT = 20
const PAGE_STARTS = [0, 150, 300, 450]
const PAGE_SIZE = 150
const ONE_DAY = 1000 * 60 * 60 * 24

function Home() {
  const trpc = useTRPC()

  const [q, setQ] = React.useState('')
  const [stateCode, setStateCode] = React.useState('')
  const [designation, setDesignation] = React.useState('')
  const [sort, setSort] = React.useState<'fullName' | '-fullName'>('fullName')
  const [start, setStart] = React.useState(0)

  // Reset pagination on filter/sort change
  React.useEffect(() => { setStart(0) }, [q, stateCode, designation, sort])

  const results = useQueries({
    queries: PAGE_STARTS.map((pageStart) => ({
      ...trpc.parks.list.queryOptions({ start: pageStart, limit: PAGE_SIZE }),
      staleTime: ONE_DAY,
    })),
  })

  const allParks: Park[] = results.flatMap((r) => r.data ?? [])
  const isLoading = allParks.length === 0 && results.some((r) => r.isLoading)
  const isError = allParks.length === 0 && results.every((r) => r.isError)

  const designations = React.useMemo(
    () => [...new Set(allParks.map((p) => p.designation).filter(Boolean))].sort() as string[],
    [allParks],
  )

  const filtered = React.useMemo(() => {
    let result = allParks
    if (q) result = result.filter((p) => p.fullName.toLowerCase().includes(q.toLowerCase()))
    if (stateCode) result = result.filter((p) => p.states.split(',').map((s) => s.trim()).includes(stateCode))
    if (designation) result = result.filter((p) => p.designation === designation)
    return [...result].sort((a, b) =>
      sort === 'fullName' ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName),
    )
  }, [allParks, q, stateCode, designation, sort])

  const total = filtered.length
  const page = filtered.slice(start, start + LIMIT)
  const rangeStart = total === 0 ? 0 : start + 1
  const rangeEnd = Math.min(start + LIMIT, total)
  const hasPrev = start > 0
  const hasNext = start + LIMIT < total

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold tracking-tight">National Parks</h1>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="neo-input h-9 px-3 text-sm w-56 bg-background"
        />

        <select
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value)}
          className="neo-input h-9 px-3 text-sm bg-background"
        >
          <option value="">All states</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>

        <select
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          className="neo-input h-9 px-3 text-sm bg-background"
        >
          <option value="">All types</option>
          {designations.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'fullName' | '-fullName')}
          className="neo-input h-9 px-3 text-sm bg-background"
        >
          <option value="fullName">Name A–Z</option>
          <option value="-fullName">Name Z–A</option>
        </select>
      </div>

      {/* Status / count */}
      <p className="mt-3 text-sm text-muted-foreground">
        {isLoading
          ? 'Loading…'
          : isError
          ? 'Could not load parks.'
          : total === 0
          ? 'No parks found.'
          : `Showing ${rangeStart}–${rangeEnd} of ${total} parks`}
      </p>

      {/* List */}
      {isLoading ? (
        <ul className="mt-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="neo-card p-4 space-y-2 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p className="mt-4 text-sm text-red-600">Failed to fetch parks. Please try again.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {page.map((park) => (
            <li key={park.id}>
              <Link
                to="/parks/$parkCode"
                params={{ parkCode: park.parkCode }}
                className="neo-card block p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <h2 className="font-semibold leading-snug">{park.fullName}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[park.designation, park.states].filter(Boolean).join(' · ')}
                </p>
                {park.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {park.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {!isLoading && !isError && total > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <button
            disabled={!hasPrev}
            onClick={() => setStart(start - LIMIT)}
            className="neo-btn px-3 py-1.5 text-sm disabled:opacity-40 bg-background"
          >
            ← Previous
          </button>
          <button
            disabled={!hasNext}
            onClick={() => setStart(start + LIMIT)}
            className="neo-btn px-3 py-1.5 text-sm disabled:opacity-40 bg-background"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
