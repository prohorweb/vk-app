import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const DAY_MS = 24 * 60 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: DAY_MS,
    },
  },
})

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'avacha-vk-app.cache',
})

export const queryPersistMaxAge = DAY_MS
