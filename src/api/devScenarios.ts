import { enableDevKineticPolling } from '../lib/devKinetic.ts'
import { setActiveDevScenario } from '../lib/devScenarioState.ts'
import { getAccessToken } from './token.ts'
import { ApiError, OfflineError, apiBaseUrl, hasApiUrl } from './client.ts'
import {
  setMockScenario,
  startMockKineticDemo,
} from './mocks/demoStore.ts'
import { useMockApi } from './mocks/useMockApi.ts'

export type DevScenarioName = 'upcoming' | 'live' | 'finished'

/** В сценарии `live` у Дорохова (№7) device_id = 7. */
export const DEV_KINETIC_DEVICE_ID = 7

const MOCK_LIVE_SETTLE_MS = 400

async function postDevPath(pathSuffix: string): Promise<void> {
  if (!navigator.onLine) {
    throw new OfflineError()
  }
  if (!hasApiUrl) {
    throw new ApiError(0, 'Не задан VITE_API_URL')
  }

  const headers = new Headers({ Accept: 'application/json' })
  const token = getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/dev/scenarios/${pathSuffix}`, {
    method: 'POST',
    headers,
  })

  if (response.status === 403) {
    throw new ApiError(403, 'Dev API недоступен: не ENV=dev')
  }
  if (!response.ok) {
    throw new ApiError(response.status || 0, 'Не удалось применить сценарий')
  }
}

/** Полная перезаливка БД демо-сценарием (~1 с), либо переключение mock-фикстур. */
export async function applyDevScenario(name: DevScenarioName): Promise<void> {
  if (useMockApi) {
    setMockScenario(name)
    setActiveDevScenario(name, name === 'live' ? MOCK_LIVE_SETTLE_MS : 0)
    return
  }
  await postDevPath(name)
  setActiveDevScenario(name)
}

/** Фоновый kinetic: на бэке точка каждые ~3 с; в mock — клиентская интерполяция. */
export async function startKineticDemo(deviceId: number): Promise<void> {
  if (useMockApi) {
    startMockKineticDemo(deviceId, () => {
      // Query invalidation happens in the menu after mutate success;
      // kinetic ticks rely on accelerated map polling + store overlay.
    })
    enableDevKineticPolling()
    return
  }
  await postDevPath(`move/${deviceId}`)
}
