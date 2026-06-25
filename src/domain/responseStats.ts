import { CHANNELS } from '@/domain/channels'
import { getRate } from '@/domain/maths'
import { WEEKDAYS_SHORT } from '@/domain/dates'

/**
 * One aggregated row returned by the `response_rate_stats` Postgres function,
 * at the shared grain (channel x period x ISO day-of-week).
 */
export interface StatRow {
  channel: string // message type, e.g. "EMAIL_SENT"
  period: 'current' | 'previous'
  dayOfWeek: number // ISODOW: Monday = 1 ... Sunday = 7
  sent: number
  responded: number
}

// ---- Chart 1 shape: per channel, current vs previous ----

export interface ChannelRow {
  channel: string // display label
  currentRate: number
  previousRate: number
  currentReplied: number
  currentTotal: number
  previousReplied: number
  previousTotal: number
}

// ---- Chart 2 shape: per weekday, per channel (current period) ----

export interface DailyChannelStat {
  replied: number
  total: number
  rate: number
}

export interface DailyRow {
  weekday: number // display index 0 (Mon) ... 6 (Sun)
  label: string
  stats: Record<string, DailyChannelStat> // keyed by channel.key
}

export function buildStatsQuery(): string {
  return `query Stats($userId: uuid!, $curFrom: timestamptz!, $curTo: timestamptz!, $prevFrom: timestamptz!, $prevTo: timestamptz!) {
  response_rate_stats(args: { userid: $userId, curfrom: $curFrom, curto: $curTo, prevfrom: $prevFrom, prevto: $prevTo }) {
    channel
    period
    dayOfWeek
    sent
    responded
  }
}`
}

/** Chart 1: sum over day-of-week, grouped by channel and period. */
export function toChannelRows(rows: StatRow[]): ChannelRow[] {
  return CHANNELS.map((channel) => {
    const totals = { currentReplied: 0, currentTotal: 0, previousReplied: 0, previousTotal: 0 }
    for (const row of rows) {
      if (row.channel !== channel.type) {
        continue
      }
      if (row.period === 'current') {
        totals.currentTotal += row.sent
        totals.currentReplied += row.responded
      } else {
        totals.previousTotal += row.sent
        totals.previousReplied += row.responded
      }
    }
    return {
      channel: channel.label,
      currentRate: getRate(totals.currentReplied, totals.currentTotal),
      previousRate: getRate(totals.previousReplied, totals.previousTotal),
      currentReplied: totals.currentReplied,
      currentTotal: totals.currentTotal,
      previousReplied: totals.previousReplied,
      previousTotal: totals.previousTotal
    }
  })
}

/** Chart 2: current period only, grouped by weekday x channel. */
export function toDailyRows(rows: StatRow[]): DailyRow[] {
  const channelByType = new Map(CHANNELS.map(channel => [channel.type, channel]))

  const days: DailyRow[] = WEEKDAYS_SHORT.map((label, weekday) => ({
    weekday,
    label,
    stats: Object.fromEntries(
      CHANNELS.map(channel => [channel.key, { replied: 0, total: 0, rate: 0 }])
    )
  }))

  for (const row of rows) {
    if (row.period !== 'current') {
      continue
    }
    const channel = channelByType.get(row.channel)
    const day = days[row.dayOfWeek - 1] // ISODOW 1..7 -> index 0..6
    if (!channel || !day) {
      continue
    }
    const stat = day.stats[channel.key]
    stat.total += row.sent
    stat.replied += row.responded
  }

  for (const day of days) {
    for (const stat of Object.values(day.stats)) {
      stat.rate = getRate(stat.replied, stat.total)
    }
  }

  return days
}
