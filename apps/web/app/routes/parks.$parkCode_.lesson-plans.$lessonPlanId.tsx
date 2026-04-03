import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import { useTRPC } from '~/trpc'

export const Route = createFileRoute('/parks/$parkCode_/lesson-plans/$lessonPlanId')({
  component: LessonPlanDetail,
})

function LessonPlanDetail() {
  const { parkCode, lessonPlanId } = Route.useParams()
  const trpc = useTRPC()

  const { data: lp, isLoading, isError } = useQuery(
    trpc.parks.lessonPlanDetail.queryOptions({ id: lessonPlanId }),
  )

  if (isLoading) {
    return (
      <div className="py-6 space-y-4 max-w-3xl">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-80 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (isError || !lp) {
    return (
      <div className="py-6">
        <Link to="/parks/$parkCode" params={{ parkCode }} className="text-sm text-muted-foreground hover:underline">
          ← Back to park
        </Link>
        <p className="mt-4 text-sm text-red-600">Could not load lesson plan.</p>
      </div>
    )
  }

  const subjects = Array.isArray(lp.subject) ? lp.subject : [lp.subject].filter(Boolean)
  const meta = [lp.gradeLevel, subjects.join(', '), lp.duration].filter(Boolean).join(' · ')

  const hasStandards =
    lp.commonCore?.stateStandards ||
    lp.commonCore?.additionalStandards ||
    lp.commonCore?.mathStandards?.length > 0 ||
    lp.commonCore?.elaStandards?.length > 0

  return (
    <div className="py-6 max-w-3xl">
      <Link to="/parks/$parkCode" params={{ parkCode }} className="text-sm text-muted-foreground hover:underline">
        ← Back to park
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">{lp.title}</h1>
      {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}

      {lp.questionObjective && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight border-b pb-2 mb-3">Learning Objectives</h2>
          <p className="text-sm leading-relaxed">{lp.questionObjective}</p>
        </section>
      )}

      {hasStandards && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight border-b pb-2 mb-3">Educational Standards</h2>
          <div className="space-y-4">
            {lp.commonCore.stateStandards && (
              <div>
                <h3 className="text-sm font-medium mb-1">State Standards</h3>
                <p className="text-sm text-muted-foreground">{lp.commonCore.stateStandards}</p>
              </div>
            )}
            {lp.commonCore.additionalStandards && (
              <div>
                <h3 className="text-sm font-medium mb-1">Additional Standards</h3>
                <p className="text-sm text-muted-foreground">{lp.commonCore.additionalStandards}</p>
              </div>
            )}
            {lp.commonCore.mathStandards?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1">Math Standards</h3>
                <ul className="list-disc list-inside space-y-0.5">
                  {lp.commonCore.mathStandards.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {lp.commonCore.elaStandards?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1">ELA Standards</h3>
                <ul className="list-disc list-inside space-y-0.5">
                  {lp.commonCore.elaStandards.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
