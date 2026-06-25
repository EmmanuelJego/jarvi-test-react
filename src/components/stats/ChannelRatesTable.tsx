import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { ChannelRow } from '@/domain/responseStats'
import { ChartState } from '@/components/stats/chartShared'
import { percentFormatter } from '@/components/stats/chartHelpers'

interface ChannelRatesTableProps {
  rows: ChannelRow[]
  pending: boolean
  error: string | null
}

function Evolution({ current, previous }: { current: number; previous: number }) {
  if (current > previous) {
    return <span className="text-green-600">▲ +{percentFormatter(Math.round((current - previous) * 10) / 10)}</span>
  }
  if (current < previous) {
    return <span className="text-red-600">▼ {percentFormatter(Math.round((current - previous) * 10) / 10)}</span>
  }
  return <span className="text-muted-foreground">—</span>
}

export function ChannelRatesTable({ rows, pending, error }: ChannelRatesTableProps) {
  const hasData = useMemo(
    () => rows.some(row => row.currentTotal > 0 || row.previousTotal > 0),
    [rows]
  )

  return (
    <ChartState error={error} pending={pending} hasData={hasData}>
      <Table>
        <TableHeader className='bg-accent'>
          <TableRow>
            <TableHead>Canal</TableHead>
            <TableHead className="text-right">Période actuelle</TableHead>
            <TableHead className="text-right">Période précédente</TableHead>
            <TableHead className="text-right">Évolution</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.channel}>
              <TableCell className="font-medium">{row.channel}</TableCell>
              <TableCell className="text-right">
                {row.currentReplied} / {row.currentTotal}
                <span className="ml-2 text-xs text-muted-foreground">
                  ({percentFormatter(row.currentRate)})
                </span>
              </TableCell>
              <TableCell className="text-right">
                {row.previousReplied} / {row.previousTotal}
                <span className="ml-2 text-xs text-muted-foreground">
                  ({percentFormatter(row.previousRate)})
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <Evolution current={row.currentRate} previous={row.previousRate} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ChartState>
  )
}
