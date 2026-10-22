interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_USE_MOCK?: string
  /** Ключ VK Карт (MMR GL JS, npm `mmr-gl`). */
  readonly VITE_VK_MAPS_KEY?: string
  readonly VITE_VK_MAPS_ACCESS_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg?raw' {
  const content: string
  export default content
}
