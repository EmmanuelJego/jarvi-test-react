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

// Indexed Monday-first (display order). Matches ISODOW: Monday = 1 ... Sunday = 7,
// so a row's display index is `isodow - 1`.
export const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const
export const WEEKDAYS_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const
