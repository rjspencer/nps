import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import { useTRPC } from '~/trpc'
import type { Park, NpsEvent, ThingToDo, VisitorCenter, PassportStampLocation, LessonPlan } from '@acme/api'

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

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

function HeroCarousel({ images }: { images: Park['images'] }) {
  const slides = images.slice(0, 5)
  const [idx, setIdx] = React.useState(0)
  if (slides.length === 0) return null

  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length)
  const next = () => setIdx((i) => (i + 1) % slides.length)
  const img = slides[idx]!


  return (
    <div className="relative w-full overflow-hidden bg-muted" style={{ height: 'clamp(220px, 40vw, 480px)' }}>
      <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />

      {/* Caption overlay */}
      {(img.caption || img.credit) && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2">
          {img.caption && <p className="text-white text-sm leading-snug">{img.caption}</p>}
          {img.credit && <p className="text-white/70 text-xs mt-0.5">{img.credit}</p>}
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous image" className="neo-btn absolute left-3 top-1/2 -translate-y-1/2 bg-background px-2.5 py-1 text-lg leading-none">‹</button>
          <button onClick={next} aria-label="Next image" className="neo-btn absolute right-3 top-1/2 -translate-y-1/2 bg-background px-2.5 py-1 text-lg leading-none">›</button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to image ${i + 1}`}
                className="w-2.5 h-2.5 rounded-full border-2 border-white transition-colors"
                style={{ background: i === idx ? 'white' : 'transparent' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <section className="mt-8">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between pb-2 mb-4 group"
        style={{ borderBottom: '2px solid var(--foreground)' }}
      >
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <span className="text-muted-foreground text-sm transition-transform duration-200" style={{ display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          &#8964;
        </span>
      </button>
      {open && children}
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
    <div>
      {/* Hero carousel — full width, breaks out of container padding */}
      <div className="-mx-4 -mt-4">
        <HeroCarousel images={park.images} />
      </div>

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

      {/* Operating Hours */}
      {park.operatingHours?.length > 0 && (
        <Section title="Park Hours">
          <div className="space-y-4">
            {park.operatingHours.map((h, i) => (
              <div key={i} className="neo-card p-4">
                {park.operatingHours.length > 1 && (
                  <h3 className="font-medium mb-2">{h.name}</h3>
                )}
                {h.description && (
                  <p className="text-sm text-muted-foreground mb-3">{h.description}</p>
                )}
                <table className="w-full text-sm">
                  <tbody>
                    {DAY_ORDER.map((day) => h.standardHours[day] ? (
                      <tr key={day} className="border-b last:border-0">
                        <td className="py-1 pr-4 font-medium capitalize w-28">{day}</td>
                        <td className="py-1 text-muted-foreground">{h.standardHours[day]}</td>
                      </tr>
                    ) : null)}
                  </tbody>
                </table>
                {h.exceptions?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-1">Exceptions</p>
                    {h.exceptions.map((ex, j) => (
                      <p key={j} className="text-xs text-muted-foreground">
                        {ex.name} ({ex.startDate} – {ex.endDate})
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Visitor Centers */}
      {visitorCenters.length > 0 && (
        <Section title="Visitor Centers">
          <ul className="space-y-4">
            {visitorCenters.map((vc: VisitorCenter) => (
              <li key={vc.id} className="neo-card p-4">
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
              <li key={ev.id} className="neo-card p-4">
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
              <li key={t.id} className="neo-card p-4">
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
              <li key={p.id} className="neo-card p-4">
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
              <li key={lp.id} className="neo-card p-4">
                <h3 className="font-medium">{lp.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[lp.gradeLevel, Array.isArray(lp.subject) ? lp.subject.join(', ') : lp.subject, lp.duration].filter(Boolean).join(' · ')}
                </p>
                <Link
                  to="/parks/$parkCode/lesson-plans/$lessonPlanId"
                  params={{ parkCode, lessonPlanId: lp.id }}
                  className="mt-1 inline-block text-sm text-blue-600 hover:underline"
                >
                  View lesson plan →
                </Link>
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
    </div>
  )
}
