import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import vkBridge from '@vkontakte/vk-bridge'
import { RouterProvider } from '@vkontakte/vk-mini-apps-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import '@vkontakte/vkui/dist/vkui.css'
import { App } from './App.tsx'
import { AppConfig } from './AppConfig.tsx'
import { queryClient, queryPersistMaxAge, queryPersister } from './api/queryClient.ts'
import { router } from './routes.ts'
import './index.css'

vkBridge.send('VKWebAppInit').catch(() => undefined)

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root was not found')
}

createRoot(root).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: queryPersistMaxAge }}
    >
      <RouterProvider router={router}>
        <AppConfig>
          <App />
        </AppConfig>
      </RouterProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
)
