import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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

  return (
    <ChartState error={error} pending={pending} hasData={hasData}>
      <Table>
        <TableHeader>
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
                return (
                  <TableCell key={channel.key} className="text-right">
                    {percentFormatter(stat.rate)}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({stat.replied}/{stat.total})
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
