import { useCallback, useMemo, useState } from 'react'
import { nhost } from '@/lib/nhost'
import { BAPTISTE_USER_ID } from '@/domain/constants'
import type { Periods } from '@/domain/periods'
import {
  buildQuery,
  getRowsFromResult,
  type AggregateResult,
  type ChannelRow
} from '@/domain/responseRatesQuery'

export function useResponseRates() {
  const query = useMemo(() => buildQuery(), [])

  const [rows, setRows] = useState<ChannelRow[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (periods: Periods) => {
    setPending(true)
    setError(null)
    try {
      const { current, previous } = periods
      const { body } = await nhost.graphql.request<Record<string, AggregateResult>>({
        query,
        variables: {
          userId: BAPTISTE_USER_ID,
          curFrom: current.from,
          curTo: current.to,
          prevFrom: previous.from,
          prevTo: previous.to
        }
      })

      if (body.errors?.length) {
        throw new Error(body.errors[0]?.message ?? 'Erreur GraphQL')
      }

      const data = body.data ?? {}
      setRows(getRowsFromResult(data))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue lors du chargement des statistiques')
      setRows([])
    } finally {
      setPending(false)
    }
  }, [query])

  return { rows, pending, error, refresh }
}
