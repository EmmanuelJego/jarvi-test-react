import { useMemo } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip } from '@unovis/react'
import { GroupedBar } from '@unovis/ts'
import { CHANNELS } from '@/domain/channels'
import { WEEKDAYS_SHORT, WEEKDAYS_LONG } from '@/domain/dates'
import type { DailyRow } from '@/domain/responseStats'
import { ChartState } from '@/components/stats/chartShared'
import { buildBarTooltip, percentFormatter } from '@/components/stats/chartHelpers'

interface Bar {
  x: number
  value: number
  color: string
  channelLabel: string
  dayLabel: string
  replied: number
  total: number
}

interface ResponseRateByDayChartProps {
  rows: DailyRow[]
  pending: boolean
  error: string | null
}

const BAR_GAP = 1
const GROUP_GAP = 4 // 3 bars (0,1,2) + a gap before the next weekday group

export function ResponseRateByDayChart({ rows, pending, error }: ResponseRateByDayChartProps) {
  const hasData = useMemo(
    () => rows.some(row => Object.values(row.stats).some(stat => stat.total > 0)),
    [rows]
  )

  const bars = useMemo<Bar[]>(
    () =>
      rows.flatMap(row =>
        CHANNELS.map((channel, ci) => {
          const stat = row.stats[channel.key]
          return {
            x: row.weekday * GROUP_GAP + ci * BAR_GAP,
            value: stat.rate,
            color: channel.color,
            channelLabel: channel.label,
            dayLabel: WEEKDAYS_LONG[row.weekday],
            replied: stat.replied,
            total: stat.total
          }
        })
      ),
    [rows]
  )

  const maxRate = useMemo(
    () => Math.max(0, ...rows.flatMap(row => Object.values(row.stats).map(stat => stat.rate))),
    [rows]
  )

  const yDomain = useMemo<[number, number]>(
    () => [0, maxRate > 0 ? maxRate * 1.15 : 1],
    [maxRate]
  )

  const tickValues = useMemo(
    () => rows.map(row => row.weekday * GROUP_GAP + BAR_GAP),
    [rows]
  )

  const weekdayTick = (tick: number | Date) => {
    const index = Math.round((Number(tick) - BAR_GAP) / GROUP_GAP)
    return WEEKDAYS_SHORT[index] ?? ''
  }

  const tooltipTriggers = {
    [GroupedBar.selectors.bar]: (bar: Bar) =>
      buildBarTooltip({
        title: bar.channelLabel,
        sublabel: bar.dayLabel,
        color: bar.color,
        value: bar.value,
        replied: bar.replied,
        total: bar.total
      })
  }

  return (
    <ChartState error={error} pending={pending} hasData={hasData}>
      <VisXYContainer
        height={320}
        yDomain={yDomain}
        padding={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <VisGroupedBar
          data={bars}
          x={(bar: Bar) => bar.x}
          y={(bar: Bar) => bar.value}
          color={(bar: Bar) => bar.color}
          roundedCorners={4}
          barPadding={0.1}
          groupPadding={0.15}
        />
        <VisAxis
          type="x"
          tickValues={tickValues}
          tickFormat={weekdayTick}
          gridLine={false}
          domainLine={false}
        />
        <VisAxis
          type="y"
          tickFormat={percentFormatter}
          gridLine
          domainLine={false}
        />
        <VisTooltip triggers={tooltipTriggers} />
      </VisXYContainer>
    </ChartState>
  )
}
