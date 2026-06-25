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
import type { LegendItem } from '@/components/stats/chartHelpers'
import { CHANNELS } from '@/domain/channels'
import { ChartLegend } from '@/components/stats/chartShared'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from '@hugeicons/react'
import { HelpCircleIcon } from '@hugeicons/core-free-icons'

const CHANNEL_LEGEND_ITEMS: LegendItem[] = CHANNELS.map(channel => ({ color: channel.color, label: channel.label }))
const PERIOD_LEGEND_ITEMS: LegendItem[] = [
  { color: '#737373', label: 'Période actuelle' },
  { color: 'rgba(115, 115, 115, 0.4)', label: 'Période précédente' }
]

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
          <CardTitle className="text-xl font-semibold">
            <div className='flex flex-row gap-2'>
              <span>
                Taux de réponse
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <HugeiconsIcon icon={HelpCircleIcon} size={18} />
                </TooltipTrigger>
                <TooltipContent side='right'>
                  Réponses réçues pour les messages envoyés sur la période sélectionnée.
                </TooltipContent>
              </Tooltip>
            </div>
          </CardTitle>
          <CardDescription className='mt-2'>
            <ChartLegend items={CHANNEL_LEGEND_ITEMS} />
          </CardDescription>
          <CardAction className="flex items-center gap-2">
            <PeriodFilter value={selection} onChange={setSelection} />
          </CardAction>
        </CardHeader>
        <CardContent className='flex flex-col gap-10'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>
                Répartition par canal
              </h2>
              <ChartLegend items={PERIOD_LEGEND_ITEMS} className='text-xs' />
              <ViewToggle value={channelView} onChange={setChannelView} />
            </div>
            {channelView === 'chart' ? (
              <ResponseRateChart rows={channelRows} pending={pending} error={error} />
            ) : (
              <ChannelRatesTable rows={channelRows} pending={pending} error={error} />
            )}
          </div>

          <hr />

          <div className='flex flex-col gap-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold'>
                Répartition par jour de la semaine
              </h2>
              <ViewToggle value={dailyView} onChange={setDailyView} />
            </div>
            {dailyView === 'chart' ? (
              <ResponseRateByDayChart rows={dailyRows} pending={pending} error={error} />
            ) : (
              <DailyRatesTable rows={dailyRows} pending={pending} error={error} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
