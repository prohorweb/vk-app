import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const apiUrl = loadEnv(mode, process.cwd(), '').VITE_API_URL?.trim()

  return {
    base: './',
    server: {
      host: true,
      proxy: apiUrl
        ? undefined
        : {
            // In compose set VITE_DEV_PROXY_TARGET=http://api:8000
            ...(() => {
              const target =
                process.env.VITE_DEV_PROXY_TARGET?.trim() || 'http://127.0.0.1:8000'
              return {
                '/api': { target, changeOrigin: true },
                // Фото участников/контента приходят как /media/... с API.
                '/media': { target, changeOrigin: true },
              }
            })(),
          },
    },
    plugins: [react()],
  }
})
