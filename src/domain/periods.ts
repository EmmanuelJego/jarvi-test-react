import { DAY_MS, getStartOfDay, dateFormatter } from '@/domain/dates'

export interface Period {
  from: string
  to: string
}

export interface Periods {
  current: Period
  previous: Period
}

export type PeriodPreset = '7d' | '30d' | 'custom'
type CustomPeriodSelection = { preset: 'custom', from: Date, to: Date }
export type PeriodSelection = { preset: '7d' } | { preset: '30d' } | CustomPeriodSelection

const PRESET_DAYS: Record<Exclude<PeriodPreset, 'custom'>, number> = {
  '7d': 7,
  '30d': 30
}

export const PERIOD_PRESET_OPTIONS = [
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
  { value: 'custom', label: 'Personnalisé' }
] as const

/**
 * Builds the complete Periods object (current + previous) from a single period
 */
function getWithPrevious(current: Period): Periods {
  const from = new Date(current.from)
  const to = new Date(current.to)
  const duration = to.getTime() - from.getTime()
  return {
    current,
    previous: {
      from: new Date(from.getTime() - duration).toISOString(),
      to: current.from
    }
  }
}

function resolveCustomPeriods(selection: CustomPeriodSelection): Periods {
  const from = getStartOfDay(selection.from)
  const to = new Date(getStartOfDay(selection.to).getTime() + DAY_MS)
  return getWithPrevious({ from: from.toISOString(), to: to.toISOString() })
}

function resolvePresetPeriods(selection: Exclude<PeriodSelection, CustomPeriodSelection>, now: Date): Periods {
  const days = PRESET_DAYS[selection.preset]
  const from = new Date(now.getTime() - days * DAY_MS)
  return getWithPrevious({ from: from.toISOString(), to: now.toISOString() })
}

export function resolvePeriods(selection: PeriodSelection, now: Date = new Date()): Periods {
  if (selection.preset === 'custom') {
    return resolveCustomPeriods(selection)
  }
  return resolvePresetPeriods(selection, now)
}

export function formatPeriodLabel(period: Period): string {
  const from = new Date(period.from)
  const to = new Date(new Date(period.to).getTime() - DAY_MS)
  return `${dateFormatter.format(from)} - ${dateFormatter.format(to)}`
}
