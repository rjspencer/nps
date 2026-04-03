import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import { useTRPC } from '~/trpc'
import type { NpsEvent, ThingToDo, VisitorCenter, PassportStampLocation, LessonPlan } from '@acme/api'

const STAMP_TYPE_LABELS: Record<string, string> = {
  visitorcenters: 'Visitor Center',
  parkoffices: 'Park Office',
  entrancestations: 'Entrance Station',
  flagpoles: 'Flagpole',
}

function formatStampType(type: string) {
  return STAMP_TYPE_LABELS[type] ?? type.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
}

export const Route = createFileRoute('/parks/$parkCode')({
  component: ParkDetail,
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold tracking-tight border-b pb-2 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function ParkDetail() {
  const { parkCode } = Route.useParams()
  const trpc = useTRPC()

  const { data, isLoading, isError } = useQuery(
    trpc.parks.detail.queryOptions({ parkCode }),
  )

  if (isLoading) {
    return (
      <div className="py-6 space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-20 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (isError || !data?.park) {
    return (
      <div className="py-6">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to parks</Link>
        <p className="mt-4 text-red-600 text-sm">Could not load park details.</p>
      </div>
    )
  }

  const { park, events, thingsToDo, visitorCenters, passportStampLocations, lessonPlans } = data

  return (
    <div className="py-6 max-w-3xl">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to parks</Link>

      {/* Header */}
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{park.fullName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {[park.designation, park.states].filter(Boolean).join(' · ')}
      </p>
      {park.description && (
        <p className="mt-3 text-sm leading-relaxed">{park.description}</p>
      )}
      {park.url && (
        <a href={park.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
          Official website →
        </a>
      )}

      {/* Visitor Centers */}
      {visitorCenters.length > 0 && (
        <Section title="Visitor Centers">
          <ul className="space-y-4">
            {visitorCenters.map((vc: VisitorCenter) => (
              <li key={vc.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{vc.name}</h3>
                {vc.description && <p className="mt-1 text-sm text-muted-foreground">{vc.description}</p>}
                {vc.directionsInfo && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium">Directions:</span> {vc.directionsInfo}</p>}
                {vc.operatingHours?.[0] && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Hours:</span> {vc.operatingHours[0].description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Events */}
      {events.length > 0 && (
        <Section title="Upcoming Events">
          <ul className="space-y-3">
            {events.map((ev: NpsEvent) => (
              <li key={ev.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{ev.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[ev.dateStart, ev.dateEnd].filter(Boolean).join(' – ')}
                  {ev.location ? ` · ${ev.location}` : ''}
                </p>
                {ev.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: ev.description }}
                  />
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Things To Do */}
      {thingsToDo.length > 0 && (
        <Section title="Things To Do">
          <ul className="space-y-3">
            {thingsToDo.map((t: ThingToDo) => (
              <li key={t.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{t.title}</h3>
                {t.shortDescription && (
                  <p className="mt-1 text-sm text-muted-foreground">{t.shortDescription}</p>
                )}
                {t.season?.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">Season: {t.season.join(', ')}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Passport Stamp Locations */}
      {passportStampLocations.length > 0 && (
        <Section title="Passport Stamp Locations">
          <ul className="space-y-2">
            {passportStampLocations.map((p: PassportStampLocation) => (
              <li key={p.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{p.label}</h3>
                {p.type && <p className="text-xs text-muted-foreground mt-0.5">{formatStampType(p.type)}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Lesson Plans */}
      {lessonPlans.length > 0 && (
        <Section title="Lesson Plans">
          <ul className="space-y-2">
            {lessonPlans.map((lp: LessonPlan) => (
              <li key={lp.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{lp.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[lp.gradeLevel, lp.subject, lp.duration].filter(Boolean).join(' · ')}
                </p>
                {lp.url && (
                  <a href={lp.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-blue-600 hover:underline">
                    View lesson plan →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Empty state */}
      {events.length === 0 && thingsToDo.length === 0 && visitorCenters.length === 0 &&
       passportStampLocations.length === 0 && lessonPlans.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">No additional details available for this park.</p>
      )}
    </div>
  )
}
