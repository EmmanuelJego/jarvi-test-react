import { createClient, type NhostClient } from '@nhost/nhost-js'
import { DEMO_CREDENTIALS } from '@/domain/constants'

export const nhost: NhostClient = createClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION
})

/**
 * Signs in with the demo credentials if there is no active session yet.
 */
export async function ensureAuth(): Promise<void> {
  if (nhost.getUserSession()) {
    return
  }

  try {
    await nhost.auth.signInEmailPassword({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[nhost] Error during nhost authentication:', message)
  }
}
