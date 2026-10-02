import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import vkBridge from '@vkontakte/vk-bridge'
import { RouterProvider } from '@vkontakte/vk-mini-apps-router'
import { QueryClientProvider } from '@tanstack/react-query'
import '@vkontakte/vkui/dist/vkui.css'
import { App } from './App.tsx'
import { AppConfig } from './AppConfig.tsx'
import { queryClient } from './api/queryClient.ts'
import { router } from './routes.ts'
import './index.css'

vkBridge.send('VKWebAppInit').catch(() => undefined)

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root was not found')
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}>
        <AppConfig>
          <App />
        </AppConfig>
      </RouterProvider>
    </QueryClientProvider>
  </StrictMode>,
)
