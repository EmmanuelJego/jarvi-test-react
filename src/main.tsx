import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ensureAuth } from '@/lib/nhost'

// Authenticate against nhost before mounting the app (ports the Nuxt
// `nhost.client.ts` plugin, which awaited sign-in before any page logic).
void ensureAuth().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
