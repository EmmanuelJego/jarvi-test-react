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
import { ResponseRateByDayChart } from '@/components/stats/ResponseRateByDayChart'
import { ChannelRatesTable } from '@/components/stats/ChannelRatesTable'
import { DailyRatesTable } from '@/components/stats/DailyRatesTable'
import { ViewToggle, type ChartView } from '@/components/stats/ViewToggle'
import { useResponseStats } from '@/hooks/useResponseStats'
import { toChannelRows, toDailyRows } from '@/domain/responseStats'
import { resolvePeriods, type PeriodSelection } from '@/domain/periods'

export function StatsPage() {
  const [selection, setSelection] = useState<PeriodSelection>({ preset: '30d' })
  const periods = useMemo(() => resolvePeriods(selection), [selection])

  const [channelView, setChannelView] = useState<ChartView>('chart')
  const [dailyView, setDailyView] = useState<ChartView>('chart')

  const { rows, pending, error, refresh } = useResponseStats()

  useEffect(() => {
    document.title = 'Statistiques · Jarvi'
  }, [])

  useEffect(() => {
    void refresh(periods)
  }, [periods, refresh])

  const channelRows = useMemo(() => toChannelRows(rows), [rows])
  const dailyRows = useMemo(() => toDailyRows(rows), [rows])

  return (
    <div className="py-6 mx-auto max-w-300 ">
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
          <CardAction className="flex items-center gap-2">
            <PeriodFilter value={selection} onChange={setSelection} />
            <ViewToggle value={channelView} onChange={setChannelView} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {channelView === 'chart' ? (
            <ResponseRateChart rows={channelRows} pending={pending} error={error} />
          ) : (
            <ChannelRatesTable rows={channelRows} pending={pending} error={error} />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">
            Taux de réponse par jour
          </CardTitle>
          <CardDescription>
            Taux de réponse par jour de la semaine, par canal, sur la période sélectionnée.
          </CardDescription>
          <CardAction>
            <ViewToggle value={dailyView} onChange={setDailyView} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {dailyView === 'chart' ? (
            <ResponseRateByDayChart rows={dailyRows} pending={pending} error={error} />
          ) : (
            <DailyRatesTable rows={dailyRows} pending={pending} error={error} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
