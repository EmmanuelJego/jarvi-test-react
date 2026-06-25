import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { HugeiconsIcon } from '@hugeicons/react'
import { StarIcon } from '@hugeicons/core-free-icons'
import { CHANNELS } from '@/domain/channels'
import type { DailyRow } from '@/domain/responseStats'
import { ChartState } from '@/components/stats/chartShared'
import { percentFormatter } from '@/components/stats/chartHelpers'

interface DailyRatesTableProps {
  rows: DailyRow[]
  pending: boolean
  error: string | null
}

export function DailyRatesTable({ rows, pending, error }: DailyRatesTableProps) {
  const hasData = useMemo(
    () => rows.some(row => Object.values(row.stats).some(stat => stat.total > 0)),
    [rows]
  )

  // Best-performing day per channel (highlighted cell in each channel column).
  const bestRateByChannel = useMemo(() => {
    const best: Record<string, number> = {}
    for (const channel of CHANNELS) {
      best[channel.key] = Math.max(0, ...rows.map(row => row.stats[channel.key].rate))
    }
    return best
  }, [rows])

  return (
    <ChartState error={error} pending={pending} hasData={hasData}>
      <Table>
        <TableHeader className='bg-accent'>
          <TableRow>
            <TableHead>Jour</TableHead>
            {CHANNELS.map(channel => (
              <TableHead key={channel.key} className="text-right">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: channel.color }} />
                  {channel.label}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.weekday}>
              <TableCell className="font-medium">{row.label}</TableCell>
              {CHANNELS.map(channel => {
                const stat = row.stats[channel.key]
                const isBest = stat.rate === bestRateByChannel[channel.key] && bestRateByChannel[channel.key] > 0
                return (
                  <TableCell key={channel.key} className="text-right">
                    {isBest && (
                      <HugeiconsIcon icon={StarIcon} className="mr-1 inline size-3 text-yellow-500 mb-0.5" />
                    )}
                    {stat.replied} / {stat.total}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({percentFormatter(stat.rate)})
                    </span>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ChartState>
  )
}
