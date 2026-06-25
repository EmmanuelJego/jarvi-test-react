/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NHOST_SUBDOMAIN: string
  readonly VITE_NHOST_REGION: string
  readonly VITE_NHOST_DEMO_EMAIL: string
  readonly VITE_NHOST_DEMO_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
