// I initially wanted to use a higher-level charts module, but since I needed more
// customizability I used the underlying lib (unovis) directly — same as the Vue app.

import { useMemo } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip, VisXYLabels } from '@unovis/react'
import { GroupedBar } from '@unovis/ts'
import { CHANNELS } from '@/domain/channels'
import { getColorWithAlpha } from '@/domain/colors'
import type { ChannelRow } from '@/domain/responseStats'
import { ChartState, ChartLegend } from '@/components/stats/chartShared'
import { buildBarTooltip, percentFormatter } from '@/components/stats/chartHelpers'

interface Bar {
  x: number
  value: number
  color: string
  channel: string
  period: string
  replied: number
  total: number
}

interface BarLabel {
  x: number
  y: number
  value: number
}

interface Evolution {
  x: number
  y: number
  glyph: string
  color: string
}

interface ResponseRateChartProps {
  rows: ChannelRow[]
  pending: boolean
  error: string | null
}

const PAIR_GAP = 1
const CHANNEL_GAP = 3

const channelColors: Record<string, string> = Object.fromEntries(
  CHANNELS.map(channel => [channel.label, channel.color])
)

const LEGEND_ITEMS = [
  { color: '#737373', label: 'Période actuelle' },
  { color: 'rgba(115, 115, 115, 0.4)', label: 'Période précédente' }
]

export function ResponseRateChart({ rows, pending, error }: ResponseRateChartProps) {
  const hasData = useMemo(
    () => rows.some(row => row.currentTotal > 0 || row.previousTotal > 0),
    [rows]
  )

  const bars = useMemo<Bar[]>(
    () =>
      rows.flatMap((row, index) => {
        const base = channelColors[row.channel] ?? '#3f51b6'
        const start = index * CHANNEL_GAP
        return [
          { x: start, value: row.currentRate, color: base, channel: row.channel, period: 'Période actuelle', replied: row.currentReplied, total: row.currentTotal },
          { x: start + PAIR_GAP, value: row.previousRate, color: getColorWithAlpha(base, 0.4), channel: row.channel, period: 'Période précédente', replied: row.previousReplied, total: row.previousTotal }
        ]
      }),
    [rows]
  )

  const maxRate = useMemo(
    () => Math.max(0, ...rows.flatMap(row => [row.currentRate, row.previousRate])),
    [rows]
  )
  const lift = maxRate * 0.05

  const yDomain = useMemo<[number, number]>(
    () => [0, maxRate > 0 ? maxRate * 1.28 : 1],
    [maxRate]
  )

  const labelData = useMemo<BarLabel[]>(
    () => bars.map(bar => ({ x: bar.x, y: bar.value + lift, value: bar.value })),
    [bars, lift]
  )

  const tickValues = useMemo(
    () => rows.map((_, index) => index * CHANNEL_GAP + PAIR_GAP / 2),
    [rows]
  )

  const channelTick = (tick: number | Date) => {
    const index = Math.round((Number(tick) - PAIR_GAP / 2) / CHANNEL_GAP)
    return rows[index]?.channel ?? ''
  }

  /**
   * Evolution indicators:
   * green ▲ for increase,
   * red ▼ for decrease,
   * grey — for stable
   */
  const evolutionData = useMemo<Evolution[]>(
    () =>
      rows.map((row, index) => {
        const x = index * CHANNEL_GAP + PAIR_GAP / 2
        const y = Math.max(row.currentRate, row.previousRate) + lift * 2.4
        if (row.currentRate > row.previousRate) return { x, y, glyph: '▲', color: '#16a34a' }
        if (row.currentRate < row.previousRate) return { x, y, glyph: '▼', color: '#dc2626' }
        return { x, y, glyph: '—', color: '#9ca3af' }
      }),
    [rows, lift]
  )

  const tooltipTriggers = {
    [GroupedBar.selectors.bar]: (bar: Bar) =>
      buildBarTooltip({
        title: bar.channel,
        sublabel: bar.period,
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
          groupPadding={0.1}
        />
        <VisXYLabels
          data={labelData}
          x={(label: BarLabel) => label.x}
          y={(label: BarLabel) => label.y}
          label={(label: BarLabel) => percentFormatter(label.value)}
          color="#4b5563"
          labelFontSize={11}
          backgroundColor="transparent"
          clustering={false}
        />
        <VisXYLabels
          data={evolutionData}
          x={(item: Evolution) => item.x}
          y={(item: Evolution) => item.y}
          label={(item: Evolution) => item.glyph}
          color={(item: Evolution) => item.color}
          labelFontSize={16}
          backgroundColor="transparent"
          clustering={false}
        />
        <VisAxis
          type="x"
          tickValues={tickValues}
          tickFormat={channelTick}
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

      <ChartLegend items={LEGEND_ITEMS} />
    </ChartState>
  )
}
