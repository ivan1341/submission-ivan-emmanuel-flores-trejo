/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_NODE_ENV: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_FILE_UPLOAD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
