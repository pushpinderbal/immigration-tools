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
        <ul className="divide-y divide-line">
          {recommendations.map((r) => {
            const isLoss = r.id === 'age-warning'
            return (
              <li key={r.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-medium text-ink">{r.title}</h3>
                  <span
                    className={cn(
                      'shrink-0 rounded-md px-2 py-1 font-mono text-[11px] font-semibold tabular-nums',
                      isLoss ? 'bg-accent-soft text-muted' : 'bg-accent-soft text-accent',
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
