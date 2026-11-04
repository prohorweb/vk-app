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
            '/api': {
              // In compose set VITE_DEV_PROXY_TARGET=http://api:8000
              target:
                process.env.VITE_DEV_PROXY_TARGET?.trim() ||
                'http://127.0.0.1:8000',
              changeOrigin: true,
            },
          },
    },
    plugins: [react()],
  }
})
