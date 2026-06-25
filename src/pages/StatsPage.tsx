import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { PeriodFilter } from '@/components/stats/PeriodFilter'
import { ResponseRateChart } from '@/components/stats/ResponseRateChart'
import { resolvePeriods, type PeriodSelection } from '@/domain/periods'

export function StatsPage() {
  const [selection, setSelection] = useState<PeriodSelection>({ preset: '30d' })
  const periods = useMemo(() => resolvePeriods(selection), [selection])

  useEffect(() => {
    document.title = 'Statistiques · Jarvi'
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Statistiques
      </h1>

      <Card className="mt-6">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">
            Taux de réponse par canal
          </CardTitle>
          <CardDescription>
            %age de réponses réçues pour les messages envoyés sur la période sélectionnée.
          </CardDescription>
          <CardAction>
            <PeriodFilter value={selection} onChange={setSelection} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <ResponseRateChart periods={periods} />
        </CardContent>
      </Card>
    </div>
  )
}
