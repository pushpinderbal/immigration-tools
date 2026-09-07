import { useMemo } from 'react'
import { getCrsRecommendations } from '../lib/crs/recommendations'
import type { CrsInput } from '../lib/crs/types'
import { Section, cn } from './ui'

export function Recommendations({ input, currentTotal }: { input: CrsInput; currentTotal: number }) {
  const recommendations = useMemo(() => getCrsRecommendations(input), [input])

  return (
    <Section title="Ways to improve your score">
      {recommendations.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted">
          Your profile already earns the maximum points from the main factors at {currentTotal} points. Check the
          latest Express Entry draw cutoffs to see how your score compares.
        </p>
      ) : (
        <ul className="recommendation-list divide-y divide-line">
          {recommendations.map((r, index) => {
            const isLoss = r.id === 'age-warning'
            return (
              <li key={r.id} className="recommendation-row first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="route-index shrink-0" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="text-sm font-semibold text-ink">{r.title}</h3>
                  </div>
                  <span
                    className={cn(
                      'recommendation-points shrink-0 tabular-nums',
                      isLoss && 'text-muted',
                    )}
                  >
                    {isLoss ? `Up to ${r.potential}` : `+${r.potential} points`}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{r.detail}</p>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
