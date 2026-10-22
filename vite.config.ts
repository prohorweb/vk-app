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
              target: 'http://127.0.0.1:8000',
              changeOrigin: true,
            },
          },
    },
    plugins: [react()],
  }
})
