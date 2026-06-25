// I initially wanted to use a higher-level charts module, but since I needed more
// customizability I used the underlying lib (unovis) directly — same as the Vue app.

import { useEffect, useMemo } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip, VisXYLabels } from '@unovis/react'
import { GroupedBar } from '@unovis/ts'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import { Skeleton } from '@/components/ui/skeleton'
import { useResponseRates } from '@/hooks/useResponseRates'
import { CHANNELS } from '@/domain/channels'
import { getColorWithAlpha } from '@/domain/colors'
import type { Periods } from '@/domain/periods'

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
  periods: Periods
}

const PAIR_GAP = 1
const CHANNEL_GAP = 3

const channelColors: Record<string, string> = Object.fromEntries(
  CHANNELS.map(channel => [channel.label, channel.color])
)

function percentFormatter(value: number | Date): string {
  return `${value}%`
}

// HTML content for the tooltip. Not able to inject it using JSX (unovis tooltips are raw HTML).
function getTooltipHtml(bar: Bar): string {
  const noReply = bar.total - bar.replied
  return `<div style="min-width:200px">
    <div style="font-size:13px;font-weight:600;color:#111827">${bar.channel}</div>
    <div style="margin-top:6px;display:flex;align-items:center;justify-content:space-between;gap:16px">
      <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:#6b7280">
        <span style="width:8px;height:8px;border-radius:9999px;background:${bar.color}"></span>${bar.period}
      </span>
      <span style="font-size:12px;font-weight:600;color:#111827">${percentFormatter(bar.value)}</span>
    </div>
    <div style="padding-left:14px;font-size:11px;color:#9ca3af">${bar.replied} avec réponse · ${noReply} sans réponse</div>
  </div>`
}

const tooltipTriggers = {
  [GroupedBar.selectors.bar]: getTooltipHtml
}

export function ResponseRateChart({ periods }: ResponseRateChartProps) {
  const { rows, pending, error, refresh } = useResponseRates()

  useEffect(() => {
    void refresh(periods)
  }, [periods, refresh])

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

  return (
    <div className="min-h-80">
      {error ? (
        <div className="flex h-80 flex-col items-center justify-center gap-2 text-center">
          <HugeiconsIcon icon={Alert02Icon} className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Impossible de charger les statistiques.
          </p>
          <p className="text-xs text-muted-foreground/70">{error}</p>
        </div>
      ) : pending ? (
        <Skeleton className="h-80 w-full" />
      ) : !hasData ? (
        <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
          Aucune donnée sur cette période.
        </div>
      ) : (
        <div>
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

          <div className="mt-3 flex items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-neutral-500" />
              Période actuelle
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-neutral-500/40" />
              Période précédente
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
