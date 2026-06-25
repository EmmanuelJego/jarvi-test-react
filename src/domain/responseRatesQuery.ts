import { CHANNELS, type Channel } from '@/domain/channels'
import { getRate } from '@/domain/maths'

export interface ChannelRow {
  channel: string
  currentRate: number
  previousRate: number
  currentReplied: number
  currentTotal: number
  previousReplied: number
  previousTotal: number
}

export interface AggregateResult {
  aggregate: { count: number } | null
}

type PeriodKey = 'current' | 'previous'

const PERIOD_FILTERS: Record<PeriodKey, { from: string, to: string }> = {
  current: { from: '$curFrom', to: '$curTo' },
  previous: { from: '$prevFrom', to: '$prevTo' }
} as const

function getBaseQuery(channel: Channel, from: string, to: string): string {
  return `userId: { _eq: $userId }, type: { _eq: "${channel.type}" }, createdAt: { _gte: ${from}, _lt: ${to} }`
}

function getTotalQuery(period: PeriodKey, channel: Channel, from: string, to: string): string {
  const base = getBaseQuery(channel, from, to)
  return `${channel.key}_${period}_total: historyentries_aggregate(where: { ${base}, triggerHasBeenRepliedTo: { _is_null: false } }) { aggregate { count } }`
}

function getRepliedQuery(period: PeriodKey, channel: Channel, from: string, to: string): string {
  const base = getBaseQuery(channel, from, to)
  return `${channel.key}_${period}_replied: historyentries_aggregate(where: { ${base}, triggerHasBeenRepliedTo: { _eq: true } }) { aggregate { count } }`
}

function getCompleteQuery(selections: string[]): string {
  return `query ResponseRates($userId: uuid!, $curFrom: timestamptz!, $curTo: timestamptz!, $prevFrom: timestamptz!, $prevTo: timestamptz!) {
${selections.join('\n')}
}`
}

export function buildQuery(): string {
  const periods: PeriodKey[] = ['current', 'previous']
  const selections: string[] = []

  for (const channel of CHANNELS) {
    for (const period of periods) {
      const { from, to } = PERIOD_FILTERS[period]
      selections.push(
        getTotalQuery(period, channel, from, to),
        getRepliedQuery(period, channel, from, to)
      )
    }
  }

  return getCompleteQuery(selections)
}

function getVarCount(data: Record<string, AggregateResult>, key: string): number {
  return data[key]?.aggregate?.count ?? 0
}

function getChannelRowFromResult(channel: Channel, data: Record<string, AggregateResult>): ChannelRow {
  const currentTotal = getVarCount(data, `${channel.key}_current_total`)
  const currentReplied = getVarCount(data, `${channel.key}_current_replied`)
  const previousTotal = getVarCount(data, `${channel.key}_previous_total`)
  const previousReplied = getVarCount(data, `${channel.key}_previous_replied`)

  return {
    channel: channel.label,
    currentRate: getRate(currentReplied, currentTotal),
    previousRate: getRate(previousReplied, previousTotal),
    currentReplied,
    currentTotal,
    previousReplied,
    previousTotal
  }
}

export function getRowsFromResult(data: Record<string, AggregateResult>): ChannelRow[] {
  return CHANNELS.map(channel => getChannelRowFromResult(channel, data))
}
