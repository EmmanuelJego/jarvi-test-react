export const DAY_MS = 24 * 60 * 60 * 1000

export function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
})

export const rangeFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
