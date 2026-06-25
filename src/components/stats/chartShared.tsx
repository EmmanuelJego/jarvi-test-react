import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import { Skeleton } from '@/components/ui/skeleton'
import type { LegendItem } from '@/components/stats/chartHelpers'

interface ChartStateProps {
  error: string | null
  pending: boolean
  hasData: boolean
  children: ReactNode
  emptyLabel?: string
}

/**
 * Shared loading / error / empty wrapper for the stats cards' bodies
 * (used for both the charts and the data tables).
 */
export function ChartState({
  error,
  pending,
  hasData,
  children,
  emptyLabel = 'Aucune donnée sur cette période.'
}: ChartStateProps) {
  if (error) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-2 text-center">
        <HugeiconsIcon icon={Alert02Icon} className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Impossible de charger les statistiques.
        </p>
        <p className="text-xs text-muted-foreground/70">{error}</p>
      </div>
    )
  }

  if (pending) {
    return <Skeleton className="h-80 w-full" />
  }

  if (!hasData) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    )
  }

  return <>{children}</>
}

export function ChartLegend({ items, className }: { items: LegendItem[], className?: string }) {
  return (
    <div className={"flex flex-wrap items-center gap-5 text-muted-foreground " + className}>
      {items.map(item => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="size-3 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}
